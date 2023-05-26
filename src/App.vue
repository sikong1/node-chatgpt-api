<template>
    <div>
        <el-input v-model="input" placeholder="Please input" />
        <el-button type="primary" @click="send">提交</el-button>
        <div class="box">{{ responseText }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import { onMessage } from './postMessage.js';
// import settings from "../settings.js"
import axios from 'axios'

const responseText = ref('')
onMounted(() => {
})

const input = ref('')
const messages: any = ref([])
const userInput = ref('')


const send = async () => {
    const response: any = await axios.post('http://localhost:3000/conversation', {
        message: input.value
    })
    responseText.value = response.data.response
    // const response: any = await fetch('http://127.0.0.1:3000/conversation', {
    //     method: 'post',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         stream: false,
    //         message: messages.value
    //     })
    // })
    // const data = await response.json()
    // console.log(data, 'kkkk');
    // responseText.value = data.response
}
</script>

<style>
.box {
    width: 100%;
    height: 200px;
    border: 1px solid #ccc;
    overflow: auto;
    padding: 10px;
}
</style>