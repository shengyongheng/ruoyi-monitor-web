<template>
    <div class="rrweb-play" ref="rrwebPlayRef"></div>
</template>

<script setup>
import { getRRwebPlayEvents } from "@/api/sdk-monitor/error";
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import { onMounted, ref } from 'vue';

const props = defineProps({
    sessionId: {
        type: String,
        required: ""
    },
    userId: {
        type: Number,
        required: 0
    },
})

const rrwebPlayRef = ref(null);
onMounted(() => {
    const parmas = {
        sessionId: props.sessionId,
        userId: props.userId
    }
    getRRwebPlayEvents(parmas).then((res) => {
        new rrwebPlayer({
            target: rrwebPlayRef.value,
            props: {
                events: JSON.parse(res.data.events || "[{}, {}]"),
            },
        });
    }).catch(err => {
        console.log(err);
    })
})
</script>

<style lang="scss" scoped>
.rrweb-play {
    overflow-x: auto;
}
</style>