<template>
    <v-container class="text-center py-4">
        <h3>Canción Actual</h3>
        <div>
            <a href="https://cast1.asurahosting.com/tunein/nonefern.pls" class="cc_streaminfo" data-type="song"
                data-username="nonefern" target="_blank">Cargando ...</a>
            <div>
                <strong>Título:</strong>
                <span class="cc_streaminfo" data-type="title" data-username="nonefern"></span>
            </div>
            <div>
                <strong>Bitrate:</strong>
                <span class="cc_streaminfo" data-type="bitrate" data-username="nonefern"></span>
            </div>
            <div>
                <strong>Oyentes:</strong>
                <span class="cc_streaminfo" data-type="listeners" data-username="nonefern"></span>
            </div>
            <div>
                <strong>Album:</strong>
                <span class="cc_streaminfo" data-type="trackalbum" data-username="nonefern"></span>
            </div>
            <div>
                <img class="cc_streaminfo" data-type="trackimageurl" data-username="nonefern" />
            </div>
        </div>
    </v-container>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    const script = document.createElement('script');
    script.src = 'https://cast1.asurahosting.com/system/streaminfo.js';
    script.async = true;
    document.body.appendChild(script);
});
</script>

<style sc oped>
img {
    max-height: 200px;
    margin-top: 10px;
}
</style>