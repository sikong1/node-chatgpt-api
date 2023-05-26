// import boxen from 'boxen';
// import ora from 'ora';
import clipboard from 'clipboardy'; // 粘贴板
import settingsJson from './settings/index.js'; // 设置
// import inquirer from 'inquirer'; // 交互式命令行工具
// import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import ChatGPTClient from './ChatGPTClient.js';
import BingAIClient from './BingAIClient.js';


let settings = JSON.parse(settingsJson);
let conversationData = {};

// inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt); // 注册自动完成提示

const clientToUse = settings.cliOptions.clientToUse || settings.clientToUse || 'chatgpt';

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

// console.log(tryBoxen('ChatGPT CLI', {
//   padding: 0.7, margin: 1, borderStyle: 'double', dimBorder: true,
// }));

export async function onMessage(message) { // 发送消息
  // let aiLabel = 'ChatGPT'; // AI标签
  // switch (clientToUse) { // 判断使用的AI
  //     case 'bing':
  //         aiLabel = 'Bing';
  //         break;
  //     default:
  //         aiLabel = settings.chatGptClient?.chatGptLabel || 'ChatGPT';
  //         break;
  // }
  let reply = ''; // 回复
  // const spinnerPrefix = `${aiLabel} is typing...`; // AI正在输入
  // const spinner = ora(spinnerPrefix); // 创建ora实例
  // spinner.prefixText = '\n   '; // 前缀
  // spinner.start(); // 开始
  try {
      // if (clientToUse === 'bing' && !conversationData.jailbreakConversationId) { // 如果使用的是bing
      //     // activate jailbreak mode for Bing
      //     conversationData.jailbreakConversationId = true;
      // }
      const response = await client.sendMessage(message, { // 发送消息
          ...conversationData, // 会话数据,包括conversationId,conversationSignature,parentMessageId,jailbreakConversationId
          onProgress: (token) => { // 进度
              reply += token; // 回复
              // const output = tryBoxen(`${reply.trim()}█`, { // 输出
              //     title: aiLabel, padding: 0.7, margin: 1, dimBorder: true, // 标题,内边距,外边距,边框
              // });
              // spinner.text = `${spinnerPrefix}\n${output}`; // 设置ora实例的文本
          },
      });
      let responseText; // 回复文本
      switch (clientToUse) { // 判断使用的AI
          case 'bing':
              responseText = response.details.adaptiveCards[0].body[0].text.trim() || response.response;
              break;
          default:
              responseText = response.response; // 回复文本
              break;
      }
      // clipboard.write(responseText).then(() => {}).catch(() => {}); // 复制到剪贴板
      // spinner.stop(); // 停止ora实例
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
      // const output = tryBoxen(responseText, { // 输出
      //     title: aiLabel, padding: 0.7, margin: 1, dimBorder: true, // 标题,内边距,外边距,边框
      // });
      // console.log(output); // 输出
      return responseText
  } catch (error) {
      spinner.stop();
      logError(error.json.error.message || error.body || error || 'Unknown error');
  }
}