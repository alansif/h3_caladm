<template>
	<div>
		<v-toolbar dense color="white">
			<v-toolbar-title>{{ title }}</v-toolbar-title>
			<v-spacer/>
			<v-btn fab text small @click="prev">{{"<"}}</v-btn>
			<v-btn outlined small class="mr-2 ml-2" @click="returnClick">返回</v-btn>
			<v-btn fab text small @click="next">{{">"}}</v-btn>
		</v-toolbar>

		<v-sheet height="665">
			<v-btn absolute dark fab left
				v-if="caltype==='day' && $root.caleditable"
            	color="orange"
				@click.stop="dialogsch=true,editschindex=-1"
            >
            	<v-icon>add</v-icon>
            </v-btn>

			<v-calendar
				ref="calendar"
				v-model="focus"
				color="primary"
				:show-month-on-first="false"
				@change="updateRange"
				@click:date="viewDay"
				:type="caltype"
				:first-interval="13"
				:interval-count="22"
				:interval-minutes="30"
			>
				<template v-slot:day="{ present, past, date }">
					<template v-if="trackedptz[date]">
						<v-layout column fill-height>
							<div v-for="(v,k) in colorsptz" :key="k" style="height:17px">
								<v-progress-linear rounded height="17"
									:color="v.color"
									:value="getper(date, k)"
									:active="getper(date, k) !== undefined"
									@click="progClick(date)">
									<template v-slot="{ value }">
										<span class="caption">{{ getstr(date, k) }}</span>
									</template>
								</v-progress-linear>
							</div>
						</v-layout>
					</template>
				</template>
				
				<template v-slot:day-body="{ date, timeToY, minutesToPixels }">
						<template v-for="(event,idx) in getEvents(date)">
						<div
							:key="idx"
							:style="{
								top: timeToY(event.starttime) + 'px',
								height: minutesToPixels(event.duration) + 'px',
								width:'100px',
								left: idx * 105 + 'px',
								backgroundColor: event.color
							}"
							class="my-event with-time text-center"
							@click.stop="editsch(date,idx)"
						>{{event.gender ? event.gender+'-'+event.product : ''}}</div>
					</template>
				</template>
				
			</v-calendar>
		</v-sheet>

		<div style="width:60%;">
			<v-container grid-list-md text-center>
				<v-layout wrap>
					<v-flex xs2>
						图例
					</v-flex>
					<v-flex xs2 v-for="c in colorsptz" :key="c.text">
						<v-card dark :color="c.color">
							<v-card-text class="pa-0">{{c.text}}</v-card-text>
						</v-card>
					</v-flex>
				</v-layout>
			</v-container>
		</div>

		<v-dialog persistent v-model="dialogsch" width="450">
			<v-card>
				<v-card-title>编辑{{curdate}}</v-card-title>
				<v-card-text>
					<v-form ref="formsch">
						<v-btn-toggle mandatory v-model="curptz">
							<v-flex>
								<v-btn value="t" class="mx-2" active-class="red white--text" rounded>T日</v-btn>
								<v-btn value="p" class="mx-2" active-class="blue white--text" rounded>P日</v-btn>
								<v-btn value="z" class="mx-2" active-class="green white--text" rounded>Z日</v-btn>
								<v-btn value="h" class="mx-2" active-class="purple white--text" rounded>H日</v-btn>
								<v-btn value="a" class="mx-2" active-class="amber white--text" rounded>A日</v-btn>
							</v-flex>
						</v-btn-toggle>
						<v-container grid-list-xl>
							<v-layout>
								<v-flex>
									<v-select :items="starttimes" label="开始时间" v-model="starttime" noDataText=""></v-select>
									<v-select :items="durations" label="预计用时(分钟)" v-model="duration" noDataText=""></v-select>
									<v-select :items="genders" label="性别" v-model="gender" noDataText=""></v-select>
									<v-select :items="products" label="产品" v-model="product" noDataText=""></v-select>
								</v-flex>
							</v-layout>
						</v-container>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-btn color="primary" text @click.stop="deletesch">删除</v-btn>
					<v-spacer/>
					<v-btn color="primary" text @click.stop="savesch">保存</v-btn>
					<v-btn color="primary" text @click.stop="dialogsch=false">取消</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog persistent v-model="dialog" width="500">
			<v-card>
				<v-card-title>修改{{curdate}}</v-card-title>
				<v-card-text>
					<v-form ref="form">
					<v-container grid-list-xl>
						<v-layout v-for="(a,i) in appointment.ptz" :key="i">
							<v-flex>
								<v-text-field :label="`已预约${labels[i]}`" v-model="a.used" :rules="rNum"></v-text-field>
							</v-flex>
							<v-flex class="text-center">
								<v-btn icon small @click.stop="()=>{if (a.avl>0) {--a.avl;++a.used;}}"><v-icon>arrow_back</v-icon></v-btn>
								<v-btn icon small @click.stop="()=>{if (a.used>0) {--a.used;++a.avl;}}"><v-icon>arrow_forward</v-icon></v-btn>
							</v-flex>
							<v-flex>
								<v-text-field :label="`可预约${labels[i]}`" v-model="a.avl" :rules="rNum"></v-text-field>
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
		caltype: 'month',
		focus: '',
		trackedptz: {},
		colorsptz: [
			{color:'#FF6464',text:'T日'},
			{color:'#42A5F5',text:'P日'},
			{color:'#90D090',text:'Z日'},
			{color:'#EE82EE',text:'H日'},
			{color:'#EEB266',text:'A日'},
		],
		dialog: false,
		curdate: '',
		title: '',
		labels: ['T日','P日','Z日','H日','A日'],
		appointment: {
			ptz: (new Array(5)).fill({used:0, avl:0}),
			events: null
		},
		rNum: [v => !v || v.length === 0 || !isNaN(parseInt(v)) || '不是有效的数字'],
		snackbar: false,
		snackbarmsg: '',
		snackbarcolor: 'success',
		dialogsch: false,
		editschindex: -1,
		curptz:0,
		starttime:'',
		duration:0,
		gender:'',
		product:'',
		starttimes: [],
		durations:[30,45,60,90,120],
		genders:['男','女'],
		products:['普通胃肠镜','普通胃镜','普通肠镜','无痛胃肠镜','无痛胃镜','无痛肠镜','核酸','早癌']
	}),
	mounted() {
		this.setToday();
		this.starttimes = [];
		for(let i = 8; i < 17; ++i) {
			this.starttimes.push(i + ':00');
			this.starttimes.push(i + ':15');
			this.starttimes.push(i + ':30');
			this.starttimes.push(i + ':45');
		}
	},
	methods: {
		deletesch() {
			if (!this.trackedptz[this.curdate] || !this.trackedptz[this.curdate].events) return;
			this.trackedptz[this.curdate].events.splice(this.editschindex, 1);
			this.$axios.post('/api/events', {
				date: this.curdate,
				events: this.trackedptz[this.curdate].events
			}).then(response=>{
			}).catch(err => {
				console.error(err);
			}).finally(()=>{
				this.dialogsch = false;
			});
		},
		editsch(date,idx) {
			if (!this.$root.caleditable) return;
			const s = this.trackedptz[date];
			if (!s || !s.events || !s.events[idx]) return;
			this.editschindex = idx;
			const es = s.events[idx];
//			this.curptz = {t:0,p:1,z:2,h:3,a:4}[es.ptz];
			this.curptz = es.ptz;
			this.starttime = es.starttime;
			this.duration = es.duration;
			this.gender = es.gender;
			this.product = es.product;
			this.dialogsch = true;
		},
		savesch() {
			if (this.starttime === '' || this.duration === 0 || this.gender === '' || this.product === '') return;
			if (!this.curdate || !this.trackedptz[this.curdate]) return;
			if (!this.trackedptz[this.curdate].events) this.trackedptz[this.curdate].events = [];
			const e = {
//				ptz: ['t','p','z','h','a'][this.curptz],
				ptz: this.curptz,
				starttime: this.starttime,
				duration: this.duration,
				gender: this.gender,
				product: this.product
			};
			if (this.editschindex < 0) {
				this.trackedptz[this.curdate].events.push(e);
			} else if (this.trackedptz[this.curdate].events[this.editschindex]) {
				this.trackedptz[this.curdate].events[this.editschindex] = e;
			}
			this.trackedptz[this.curdate].events.sort((a,b)=>{
				if (a.ptz === b.ptz) {
					return parseInt(a.starttime.replace(':','')) - parseInt(b.starttime.replace(':',''));
				} else {
					return a.ptz.charCodeAt() - b.ptz.charCodeAt();
				}
			});
			this.$axios.post('/api/events', {
				date: this.curdate,
				events: this.trackedptz[this.curdate].events
			}).then(response=>{
			}).catch(error => {
				console.dir(error);
			}).finally(()=>{
				this.dialogsch = false;
			});
		},
		getEvents(date) {
			if (!this.trackedptz[date]) return [];
			let schs = this.trackedptz[date].events;
			if (!schs || schs.length === 0) return [];
			const r = schs.map(v=>{
				const ptz = {t:0,p:1,z:2,h:3,a:4}[v.ptz];
				v.color = this.colorsptz[ptz].color;
				return v;
			});
			return r;
		},
		progClick(e) {
			this.focus = e;
			this.curdate = e;
			this.caltype = 'day';
		},
		returnClick() {
			if (this.caltype !== 'month') {
				this.caltype = "month";
			}
			this.setToday();
		},
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
			if (!this.$root.caleditable) return;
			this.curdate = date;
			if (this.trackedptz[this.curdate]) {
				this.appointment = this.trackedptz[this.curdate];
			} else {
				this.appointment = {
					ptz: [],
					events: null
				};
				for (let i = 0; i < 5; ++i) {
					this.appointment.ptz.push({used:0, avl:0});
				}
			}
			this.dialog = true;
		},
		saveform() {
			const s = this.appointment.ptz.reduce((acc,cur) => acc + cur.used + cur.avl, '');
			if (s === '') {
				this.dialog = false;
				return;
			}
			this.appointment.ptz.forEach(v => {
				v.used = v.used === '' ? 0 : parseInt(v.used);
				v.avl = v.avl === '' ? 0 : parseInt(v.avl);
			});
			if (!this.$refs.form.validate()) {
				return;
			}
			const c = this.appointment.ptz;
			this.$axios.post('/api/data', {
					date:	this.curdate,
					t0:		c[0].used,
					t1:		c[0].avl,
					p0:		c[1].used,
					p1:		c[1].avl,
					z0:		c[2].used,
					z1:		c[2].avl,
					h0:		c[3].used,
					h1:		c[3].avl,
					a0:		c[4].used,
					a1:		c[4].avl
				}).then(response=>{
					this.snackbarcolor = 'success';
					this.snackbarmsg = '保存成功';
					this.trackedptz[this.curdate] = this.appointment;
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
						acc[cur.date] = {
							ptz: [
								{used:cur.t_used, avl:cur.t_avl},
								{used:cur.p_used, avl:cur.p_avl},
								{used:cur.z_used, avl:cur.z_avl},
								{used:cur.h_used, avl:cur.h_avl},
								{used:cur.a_used, avl:cur.a_avl}
							],
							events: JSON.parse(cur.events)
						};
						return acc;
					}, {});
					this.trackedptz = r;
				}).catch(error => {
					console.dir(error);
				});
		},
		getper(date, ptz) {
			let v = this.trackedptz[date].ptz;
			if (!v || !v[ptz] || v[ptz].used===undefined || v[ptz].avl===undefined || (v[ptz].used + v[ptz].avl === 0)) return undefined;
			return 100 * v[ptz].used / (v[ptz].used + v[ptz].avl);
		},
		getstr(date, ptz) {
			let v = this.trackedptz[date].ptz;
			if (!v || !v[ptz] || v[ptz].used===undefined || v[ptz].avl===undefined) return "";
			return v[ptz].used + " / " + v[ptz].avl;
		},
	},
	computed: {
	},
	components: {
			HelloWorld,
	},
};
</script>

<style>
.my-event {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 3px;
  background-color: #1867c0;
  color: #ffffff;
  border: 1px solid #ffffff;
  font-size: 12px;
  padding: 3px;
  cursor: pointer;
  margin-bottom: 1px;
  left: 4px;
  margin-right: 8px;
  position: relative;
}

.my-event.with-time {
  position: absolute;
  right: 4px;
  margin-right: 0px;
}
</style>