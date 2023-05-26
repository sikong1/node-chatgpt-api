#!/usr/bin/env node
import fs from 'fs';
import { pathToFileURL } from 'url';
import { KeyvFile } from 'keyv-file';
import boxen from 'boxen';
import ora from 'ora';
import clipboard from 'clipboardy';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import ChatGPTClient from '../src/ChatGPTClient.js';
import BingAIClient from '../src/BingAIClient.js';

const arg = process.argv.find(_arg => _arg.startsWith('--settings'));
const path = arg?.split('=')[1] ?? './settings.js';

let settings;
if (fs.existsSync(path)) {
    // get the full path
    const fullPath = fs.realpathSync(path);
    settings = (await import(pathToFileURL(fullPath).toString())).default;
} else {
    if (arg) {
        console.error('Error: the file specified by the --settings parameter does not exist.');
    } else {
        console.error('Error: the settings.js file does not exist.');
    }
    process.exit(1);
}

if (settings.storageFilePath && !settings.cacheOptions.store) {
    // make the directory and file if they don't exist
    const dir = settings.storageFilePath.split('/').slice(0, -1).join('/');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(settings.storageFilePath)) {
        fs.writeFileSync(settings.storageFilePath, '');
    }

    settings.cacheOptions.store = new KeyvFile({ filename: settings.storageFilePath });
}

let conversationData = {};

const availableCommands = [
    {
        name: '!editor - Open the editor (for multi-line messages)',
        value: '!editor',
    },
    {
        name: '!resume - Resume last conversation',
        value: '!resume',
    },
    {
        name: '!new - Start new conversation',
        value: '!new',
    },
    {
        name: '!copy - Copy conversation to clipboard',
        value: '!copy',
    },
    {
        name: '!delete-all - Delete all conversations',
        value: '!delete-all',
    },
    {
        name: '!exit - Exit ChatGPT CLI',
        value: '!exit',
    },
];

inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

const clientToUse = settings.cliOptions?.clientToUse || settings.clientToUse || 'chatgpt';

let client;
switch (clientToUse) {
    case 'bing':
        client = new BingAIClient({
            ...settings.bingAiClient,
            cache: settings.cacheOptions,
        });
        break;
    default:
        client = new ChatGPTClient(
            settings.openaiApiKey || settings.chatGptClient.openaiApiKey,
            settings.chatGptClient,
            settings.cacheOptions,
        );
        break;
}

console.log(tryBoxen('ChatGPT CLI', {
    padding: 0.7, margin: 1, borderStyle: 'double', dimBorder: true,
}));

await conversation();

async function conversation() { // 创建对话
    console.log('Type "!" to access the command menu.');
    const prompt = inquirer.prompt([ // 询问
        {
            type: 'autocomplete',
            name: 'message',
            message: 'Write a message:',
            searchText: '​',
            emptyText: '​',
            suggestOnly: true,
            source: () => Promise.resolve([]),
        },
    ]);
    // hiding the ugly autocomplete hint
    prompt.ui.activePrompt.firstRender = false; // 隐藏自动补全提示
    // The below is a hack to allow selecting items from the autocomplete menu while also being able to submit messages.
    // This basically simulates a hybrid between having `suggestOnly: false` and `suggestOnly: true`.
    await new Promise(resolve => setTimeout(resolve, 0)); // 延迟0秒
    prompt.ui.activePrompt.opt.source = (answers, input) => { // 重新定义source
        if (!input) {
            return [];
        }
        prompt.ui.activePrompt.opt.suggestOnly = !input.startsWith('!');
        return availableCommands.filter(command => command.value.startsWith(input));
    };
    let { message } = await prompt; // 获取输入
    message = message.trim(); // 去除空格
    if (!message) { // 如果输入为空
        return conversation(); // 重新输入
    }
    if (message.startsWith('!')) { // 如果输入以!开头
        switch (message) {
            case '!editor':
                return useEditor();
            case '!resume':
                return resumeConversation();
            case '!new':
                return newConversation();
            case '!copy':
                return copyConversation();
            case '!delete-all':
                return deleteAllConversations();
            case '!exit':
                return true;
            default:
                return conversation();
        }
    }
    return onMessage(message); // 发送消息
}

async function onMessage(message) { // 发送消息
    let aiLabel; // AI标签
    switch (clientToUse) { // 判断使用的AI
        case 'bing':
            aiLabel = 'Bing';
            break;
        default:
            aiLabel = settings.chatGptClient?.chatGptLabel || 'ChatGPT';
            break;
    }
    let reply = ''; // 回复
    const spinnerPrefix = `${aiLabel} is typing...`; // AI正在输入
    const spinner = ora(spinnerPrefix); // 创建ora实例
    spinner.prefixText = '\n   '; // 前缀
    spinner.start(); // 开始
    try {
        if (clientToUse === 'bing' && !conversationData.jailbreakConversationId) { // 如果使用的是bing
            // activate jailbreak mode for Bing
            conversationData.jailbreakConversationId = true;
        }
        const response = await client.sendMessage(message, { // 发送消息
            ...conversationData, // 会话数据,包括conversationId,conversationSignature,parentMessageId,jailbreakConversationId
            onProgress: (token) => { // 进度
                reply += token; // 回复
                const output = tryBoxen(`${reply.trim()}█`, { // 输出
                    title: aiLabel, padding: 0.7, margin: 1, dimBorder: true, // 标题,内边距,外边距,边框
                });
                spinner.text = `${spinnerPrefix}\n${output}`; // 设置ora实例的文本
            },
        });
        let responseText; // 回复文本
        switch (clientToUse) { // 判断使用的AI
            case 'bing':
                responseText = response.details.adaptiveCards?.[0]?.body?.[0]?.text?.trim() || response.response;
                break;
            default:
                responseText = response.response; // 回复文本
                break;
        }
        clipboard.write(responseText).then(() => {}).catch(() => {}); // 复制到剪贴板
        spinner.stop(); // 停止ora实例
        switch (clientToUse) {
            case 'bing':
                conversationData = {
                    parentMessageId: response.messageId,
                    jailbreakConversationId: response.jailbreakConversationId,
                    // conversationId: response.conversationId,
                    // conversationSignature: response.conversationSignature,
                    // clientId: response.clientId,
                    // invocationId: response.invocationId,
                };
                break;
            default: // chatgpt
                conversationData = { // 会话数据
                    conversationId: response.conversationId,
                    parentMessageId: response.messageId,
                };
                break;
        }
        await client.conversationsCache.set('lastConversation', conversationData); // 保存会话数据
        const output = tryBoxen(responseText, { // 输出
            title: aiLabel, padding: 0.7, margin: 1, dimBorder: true, // 标题,内边距,外边距,边框
        });
        console.log(output); // 输出
    } catch (error) {
        spinner.stop();
        logError(error?.json?.error?.message || error.body || error || 'Unknown error');
    }
    return conversation();
}

async function useEditor() {
    let { message } = await inquirer.prompt([
        {
            type: 'editor',
            name: 'message',
            message: 'Write a message:',
            waitUserInput: false,
        },
    ]);
    message = message.trim();
    if (!message) {
        return conversation();
    }
    console.log(message);
    return onMessage(message);
}

async function resumeConversation() {
    conversationData = (await client.conversationsCache.get('lastConversation')) || {};
    if (conversationData.conversationId) {
        logSuccess(`Resumed conversation ${conversationData.conversationId}.`);
    } else {
        logWarning('No conversation to resume.');
    }
    return conversation();
}

async function newConversation() {
    conversationData = {};
    logSuccess('Started new conversation.');
    return conversation();
}

async function deleteAllConversations() {
    if (clientToUse !== 'chatgpt') {
        logWarning('Deleting all conversations is only supported for ChatGPT client.');
        return conversation();
    }
    await client.conversationsCache.clear();
    logSuccess('Deleted all conversations.');
    return conversation();
}

async function copyConversation() {
    if (clientToUse !== 'chatgpt') {
        logWarning('Copying conversations is only supported for ChatGPT client.');
        return conversation();
    }
    if (!conversationData.conversationId) {
        logWarning('No conversation to copy.');
        return conversation();
    }
    const { messages } = await client.conversationsCache.get(conversationData.conversationId);
    // get the last message ID
    const lastMessageId = messages[messages.length - 1].id;
    const orderedMessages = ChatGPTClient.getMessagesForConversation(messages, lastMessageId);
    const conversationString = orderedMessages.map(message => `#### ${message.role}:\n${message.message}`).join('\n\n');
    try {
        await clipboard.write(`${conversationString}\n\n----\nMade with ChatGPT CLI: <https://github.com/waylaidwanderer/node-chatgpt-api>`);
        logSuccess('Copied conversation to clipboard.');
    } catch (error) {
        logError(error?.message || error);
    }
    return conversation();
}

function logError(message) {
    console.log(tryBoxen(message, {
        title: 'Error', padding: 0.7, margin: 1, borderColor: 'red',
    }));
}

function logSuccess(message) {
    console.log(tryBoxen(message, {
        title: 'Success', padding: 0.7, margin: 1, borderColor: 'green',
    }));
}

function logWarning(message) {
    console.log(tryBoxen(message, {
        title: 'Warning', padding: 0.7, margin: 1, borderColor: 'yellow',
    }));
}

/**
 * Boxen can throw an error if the input is malformed, so this function wraps it in a try/catch.
 * @param {string} input
 * @param {*} options
 */
function tryBoxen(input, options) {
    try {
        return boxen(input, options);
    } catch {
        return input;
    }
}
