class Weapon {
  constructor(tab_separeted_line) {
    const data = tab_separeted_line.split("\t");
    this.id = parseInt(data[0]);
    this.category = data[1];
    this.name = data[2];
    this.mad = parseInt(data[3]);
    this.mid = parseInt(data[4]);
    this.rpm = parseInt(data[5]);
    this.ammo = parseInt(data[6]);
    this.speed = parseInt(data[7]);
  }

  get mdps() {
    return Math.round((this.mad * this.rpm) / 60);
  }
}

const sortableTable = Vue.component("sortable-table", {
  template: `          <table>
  <caption>{{category}}</caption>
    <thead>
      <tr>
        <th v-for="(value, key) in columns" v-on:click="sort(key)">
          {{ value }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="task in weapons">
        <td v-for="(value, key) in columns">
          {{ task[key] }}
        </td>
      </tr>
    </tbody>
  </table>`,
  props: ["category"],
  data: function () {
    return {
      columns: {
        id: "ID ▲",
        name: "件名",
        mad: "最大ダメージ",
        mid: "最小ダメージ",
        rpm: "RPM",
        ammo: "装填数",
        speed: "弾速",
        mdps: "最大DPS",
      },
      weapons: [],
      asc: true,
      currentSort: "id",
    };
  },
  methods: {
    sort(key) {
      //カラム名についている▲マークを取る
      this.columns[this.currentSort] = this.columns[this.currentSort].slice(
        0,
        -2
      );
      if (this.currentSort == key) this.asc = !this.asc;
      //もし既にソートしているカラムを選択したら、昇順と降順を入れ替える
      else this.asc = true; //そうでない場合は昇順
      this.columns[key] += this.asc ? " ▲" : " ▼"; //アイコンを付ける
      this.currentSort = key;

      //選択ソート
      for (let i = 0; i < this.weapons.length; i++) {
        minj = i;
        for (let j = i + 1; j < this.weapons.length; j++) {
          if (
            (this.asc && this.weapons[minj][key] > this.weapons[j][key]) ||
            (!this.asc && this.weapons[minj][key] < this.weapons[j][key])
          )
            minj = j;
        }
        const t = this.weapons[i];
        this.$set(this.weapons, i, this.weapons[minj]); //オブジェクトを操作するときは$setを使う必要がある
        this.$set(this.weapons, minj, t);
      }

      console.log("sorted!", this.weapons);
    },
    loadTsv(tsv) {
      console.log("tsv", tsv);
      this.weapons = tsv
        .split("\n")
        .map((line) => new Weapon(line))
        .filter((weapon) => weapon.category == this.category);
    },
  },
  mounted: function () {
    const req = new XMLHttpRequest();
    req.open("GET", "./data.tsv");
    req.send(null);
    req.onloadend = () => {
      this.loadTsv(req.responseText);
    };
  },
});
