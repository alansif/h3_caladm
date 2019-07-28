<template>
    <v-data-table :headers="headers" :items="trackedptz">
    </v-data-table>
</template>

<script>
    export default {
        data() {
            return {
                headers: [
                    {text:'日期', value:'date'},
                    {text:'T日已约', value:'t_used'},
                    {text:'T日剩余', value:'t_avl'},
                    {text:'P日已约', value:'p_used'},
                    {text:'P日剩余', value:'p_avl'},
                    {text:'Z日已约', value:'z_used'},
                    {text:'Z日剩余', value:'z_avl'}
                ],
                trackedptz:[]
            }
        },
        mounted() {
			this.$axios.get('/api/data',{params:{}})
				.then(response=>{
					this.trackedptz = response.data;
				}).catch(error => {
					console.dir(error);
				});
        }
    }
</script>
