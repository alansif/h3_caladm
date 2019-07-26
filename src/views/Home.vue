<template>
<!--	<HelloWorld /> -->
	<div>
		<v-toolbar flat color="white">
          <v-toolbar-title>{{ title }}</v-toolbar-title>
		  <v-spacer/>
          <v-btn fab text small @click="prev">{{"<"}}</v-btn>
          <v-btn outlined class="mr-2 ml-2" @click="setToday">本月</v-btn>
          <v-btn fab text small @click="next">{{">"}}</v-btn>
		</v-toolbar>
		<v-sheet height="580">
			<v-calendar
				ref="calendar"
				v-model="focus"
				color="primary"
				:show-month-on-first="false"
				@change="updateRange"
				@click:date="viewDay"
			>
				<template v-slot:day="{ present, past, date }">
					<template v-if="trackedptz[date]">
						<v-layout column fill-height>
							<div v-for="(v,k) in colorsptz" style="height:17px">
								<v-progress-linear height="17" :value="getper(date, k)" :color="v" :active="getper(date, k) !== undefined">
									<template v-slot="{ value }">
										<span class="caption">{{ getstr(date, k) }}</span>
									</template>
								</v-progress-linear>
							</div>
						</v-layout>
					</template>
				</template>
			</v-calendar>
		</v-sheet>
		<div style="width:50%;">
			<v-container grid-list-md text-center>
				<v-layout wrap>
					<v-flex xs3>
						图例
					</v-flex>
					<v-flex xs3>
						<v-card dark :color="colorsptz.t">
							<v-card-text class="pa-0">T日</v-card-text>
						</v-card>
					</v-flex>
					<v-flex xs3>
						<v-card dark :color="colorsptz.p">
							<v-card-text class="pa-0">P日</v-card-text>
						</v-card>
					</v-flex>
					<v-flex xs3>
						<v-card dark :color="colorsptz.z">
							<v-card-text class="pa-0">Z日</v-card-text>
						</v-card>
					</v-flex>
				</v-layout>
			</v-container>
		</div>
		<v-sheet height="60">
			<v-sheet color="red"/>
			<v-sheet color="green"/>
			<v-sheet color="blue"/>
		</v-sheet>
		<v-dialog persistent v-model="dialog" width="500">
			<v-card>
				<v-card-title>修改{{curdate}}</v-card-title>
				<v-card-text>
					<v-form ref="form">
					<v-container grid-list-xl>
						<v-layout>
							<v-flex>
								<v-text-field label="已预约T" v-model="t0" :rules="rNum"></v-text-field>
							</v-flex>
							<v-flex class="text-center">
								<v-btn icon small @click.stop="()=>{if (t1>0) {--t1;++t0;}}"><v-icon>arrow_back</v-icon></v-btn>
								<v-btn icon small @click.stop="()=>{if (t0>0) {--t0;++t1;}}"><v-icon>arrow_forward</v-icon></v-btn>
							</v-flex>
							<v-flex>
								<v-text-field label="可预约T" v-model="t1" :rules="rNum"></v-text-field>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex>
								<v-text-field label="已预约P" v-model="p0" :rules="rNum"></v-text-field>
							</v-flex>
							<v-flex class="text-center">
								<v-btn icon small @click.stop="()=>{if (p1>0) {--p1;++p0;}}"><v-icon>arrow_back</v-icon></v-btn>
								<v-btn icon small @click.stop="()=>{if (p0>0) {--p0;++p1;}}"><v-icon>arrow_forward</v-icon></v-btn>
							</v-flex>
							<v-flex>
								<v-text-field label="可预约P" v-model="p1" :rules="rNum"></v-text-field>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex>
								<v-text-field label="已预约Z" v-model="z0" :rules="rNum"></v-text-field>
							</v-flex>
							<v-flex class="text-center">
								<v-btn icon small @click.stop="()=>{if (z1>0) {--z1;++z0;}}"><v-icon>arrow_back</v-icon></v-btn>
								<v-btn icon small @click.stop="()=>{if (z0>0) {--z0;++z1;}}"><v-icon>arrow_forward</v-icon></v-btn>
							</v-flex>
							<v-flex>
								<v-text-field label="可预约Z" v-model="z1" :rules="rNum"></v-text-field>
							</v-flex>
						</v-layout>
					</v-container>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-spacer/>
					<v-btn color="primary" text @click.stop="saveform">保存</v-btn>
					<v-btn color="primary" text @click.stop="dialog=false">取消</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-snackbar v-model="snackbar" :color="snackbarcolor">
      		{{ snackbarmsg }}
    	</v-snackbar>
	</div>
</template>

<script>
import HelloWorld from '../components/HelloWorld';

export default {
	data: () => ({
		focus: '',
		trackedptz: {},
		colorsptz: {
			t: '#FF6464',
			p: 'blue',
			z: '#90D090'
		},
		dialog: false,
		curdate: '',
		title: '',
		t0: 1,
		t1: 2,
		p0: 3,
		p1: 4,
		z0: 5,
		z1: 6,
		rNum: [v => v.length === 0 || !isNaN(parseInt(v)) || '不是有效的数字'],
		snackbar: false,
		snackbarmsg: '',
		snackbarcolor: 'success'
	}),
	mounted() {
		this.setToday();
	},
	methods: {
		setToday () {
			this.focus = new Date().toISOString().substring(0,10);
		},
		prev () {
			this.$refs.calendar.prev();
		},
		next () {
			this.$refs.calendar.next();
		},
		updateRange({start, end}) {
			this.title = start.year + '年' + start.month + '月';
			this.fetchdata(start.date);
		},
		viewDay({date}) {
			this.curdate = date;
			if (this.trackedptz[this.curdate]) {
				this.t0 = this.trackedptz[this.curdate].t[0];
				this.t1 = this.trackedptz[this.curdate].t[1];
				this.p0 = this.trackedptz[this.curdate].p[0];
				this.p1 = this.trackedptz[this.curdate].p[1];
				this.z0 = this.trackedptz[this.curdate].z[0];
				this.z1 = this.trackedptz[this.curdate].z[1];
			} else {
				this.t0 = '';
				this.t1 = '';
				this.p0 = '';
				this.p1 = '';
				this.z0 = '';
				this.z1 = '';
			}
			this.dialog = true;
		},
		saveform() {
			if (this.t0+this.t1+this.p0+this.p1+this.z0+this.z1 === '') {
				this.dialog = false;
				return;
			}
			this.t0 = this.t0 === '' ? 0 : parseInt(this.t0);
			this.t1 = this.t1 === '' ? 0 : parseInt(this.t1);
			this.p0 = this.p0 === '' ? 0 : parseInt(this.p0);
			this.p1 = this.p1 === '' ? 0 : parseInt(this.p1);
			this.z0 = this.z0 === '' ? 0 : parseInt(this.z0);
			this.z1 = this.z1 === '' ? 0 : parseInt(this.z1);
			if (!this.$refs.form.validate()) {
				return;
			}
			this.$axios.post('/api/data', {
					date:	this.curdate,
					t0:		this.t0,
					t1:		this.t1,
					p0:		this.p0,
					p1:		this.p1,
					z0:		this.z0,
					z1:		this.z1
				}).then(response=>{
					this.snackbarcolor = 'success';
					this.snackbarmsg = '保存成功';
					this.trackedptz[this.curdate] = {p:[this.p0,this.p1],t:[this.t0,this.t1],z:[this.z0,this.z1]};
				}).catch(error => {
					console.dir(error);
					this.snackbarcolor = 'error';
					this.snackbarmsg = error.message;
				}).finally(()=>{
					this.snackbar = true;
					this.dialog = false;
				});
		},
		fetchdata(startdate) {
			this.$axios.get('/api/data',{params:{date:startdate}})
				.then(response=>{
					let r = response.data.reduce((acc, cur)=>{
						acc[cur.date]={p:[cur.p_used,cur.p_avl],t:[cur.t_used,cur.t_avl],z:[cur.z_used,cur.z_avl]};
						return acc;
					}, {});
					this.trackedptz = r;
				}).catch(error => {
					console.dir(error);
				});
		},
		getper(date, ptz) {
			let v = this.trackedptz[date];
			if (!v || !v[ptz] || (v[ptz][0] + v[ptz][1] === 0)) return undefined;
			return 100 * v[ptz][0] / (v[ptz][0] + v[ptz][1]);
		},
		getstr(date, ptz) {
			let v = this.trackedptz[date];
			if (!v || !v[ptz]) return "";
			return v[ptz][0] + " / " + v[ptz][1];
		},
	},
	computed: {
	},
	components: {
			HelloWorld,
	},
};
</script>
