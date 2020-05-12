<template>
    <v-data-table :headers="headers" :items="logs">
    </v-data-table>
</template>

<script>
export default {
    data() {
        return {
            headers: [
                {text:'时间', value:'optime', width:180},
                {text:'内容', value:'description'},
            ],
            logs: []
        }
    },
    mounted() {
        this.$axios.get('/api/logs',{params:{}})
            .then(response=>{
                this.logs = response.data;
            }).catch(error => {
                console.dir(error);
            });
    }
}
</script>
