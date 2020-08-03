const sortableTable = Vue.component("sortable-table", {
  template: `          <table>
  <caption>{{caption}}</caption>
    <thead>
      <tr>
        <th v-for="(value, key) of columns" v-on:click="sort(key)">
          {{value }}
        </th>
      </tr>
    </thead>
    <transition-group name="items" tag="tbody">
      <tr v-for="task in rows" v-bind:key="task[0]">
        <td v-for="value in task">
          {{ value }}
        </td>
      </tr>
    </transition-group>
  </table>`,
  props: ["src", "caption"],
  data: function () {
    return {
      columns: [],
      rows: [],
      asc: true,
      currentSort: 0,
    };
  },
  methods: {
    sort(index) {
      //カラム名についている▲マークを取る
      this.columns[this.currentSort] = this.columns[this.currentSort].slice(
        0,
        -2
      );
      if (this.currentSort == index) this.asc = !this.asc;
      //もし既にソートしているカラムを選択したら、昇順と降順を入れ替える
      else this.asc = true; //そうでない場合は昇順
      this.columns[index] += this.asc ? " ▲" : " ▼"; //アイコンを付ける
      this.currentSort = index;

      //選択ソート
      for (let i = 0; i < this.rows.length; i++) {
        minj = i;
        for (let j = i + 1; j < this.rows.length; j++) {
          if (
            (this.asc && this.rows[minj][index] > this.rows[j][index]) ||
            (!this.asc && this.rows[minj][index] < this.rows[j][index])
          )
            minj = j;
        }
        const t = this.rows[i];
        this.$set(this.rows, i, this.rows[minj]); //オブジェクトを操作するときは$setを使う必要がある
        this.$set(this.rows, minj, t);
      }

      console.log("sorted!", this.rows);
    },
    loadTsv(tsv) {
      const data = tsv.split("\n");
      this.columns = data[0].split("\t"); //先頭をカラム名として抽出
      this.rows = data.slice(1).map((
        row //正しくソートするために数値の場合は数値として扱う
      ) =>
        row.split("\t").map((element) => {
          if (isNaN(element)) return element;
          return parseFloat(element);
        })
      );
    },
  },
  mounted: function () {
    const req = new XMLHttpRequest();
    req.open("GET", this.src);
    req.send(null);
    req.onloadend = () => {
      this.loadTsv(req.responseText);
    };
  },
});
