<template>
	<v-dialog v-model="dialog" persistent width="300">
		<v-card class="pb-3">
			<v-toolbar dense dark color="primary">
				<v-toolbar-title>登录</v-toolbar-title>
			</v-toolbar>
			<v-card-text class="pl-5 pr-5">
				<v-form ref="form" lazy-validation @submit.prevent="login">
					<v-text-field prepend-icon="person" name="login" label="ID" v-model="username" required></v-text-field>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
                <v-btn color="primary" @click="login">登录</v-btn>
                <v-spacer></v-spacer>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	data() {
		return {
			dialog: true,
			username: ''
		}
	},
	methods: {
		show() {
			this.dialog = true;
		},
		login() {
			if (this.username === 'hs6262') {
				this.dialog = false;
				this.$root.caleditable = true;
				localStorage.setItem('username', this.username);
				this.$router.push('/home');
			} else if (this.username === '3939') {
				this.dialog = false;
				localStorage.setItem('username', this.username);
				this.$router.push('/home');
			}
		}
	}
}
</script>