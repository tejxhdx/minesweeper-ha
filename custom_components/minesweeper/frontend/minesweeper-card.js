/* Minesweeper for Home Assistant - bundled Lovelace card v1.2.3 */
const MINESWEEPER_CARD_VERSION = "1.2.3";
console.info(`[Minesweeper] Lovelace card loaded v${MINESWEEPER_CARD_VERSION}`);

class MinesweeperCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.level = "medium";
    this.mode = "reveal";
    this.timer = 0;
    this.interval = null;
    this.started = false;
    this.gameOver = false;
    this.flags = 0;
    this.opened = 0;
    this.records = [];
    this.myBest = null;
    this._rendered = false;
  }

  setConfig(config) {
    this.config = config || {};
    this.level = this.config.difficulty || "medium";
    this.showLeaderboard = this.config.show_leaderboard !== false;
    this.render();
    this.newGame();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loaded) {
      this._loaded = true;
      this.loadRecords();
    }
  }

  getCardSize() {
    return this.showLeaderboard === false ? 8 : 10;
  }

  getGridOptions() {
    return {
      rows: 8,
      min_rows: 6,
      max_rows: 12,
      columns: 12,
      min_columns: 6,
      max_columns: 12,
    };
  }

  static getStubConfig() {
    return {
      difficulty: "medium",
      show_leaderboard: true,
    };
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; min-width:0; container-type:inline-size; }
        ha-card { overflow:hidden; }
        .wrap { padding:16px; }
        .layout {
          display:grid;
          grid-template-columns:minmax(0, minmax(0, 2.15fr)) minmax(0, 1fr);
          gap:16px;
          align-items:start;
          width:100%;
          min-width:0;
        }
        .layout > section {
          min-width:0;
          width:100%;
        }
        .leader {
          min-width:0;
          width:100%;
          overflow:hidden;
        }
        .leader .tabs {
          min-width:0;
        }
        .leader .row {
          min-width:0;
        }
        .title,.leader-title { font-size:18px; font-weight:600; margin:0 0 12px; }
        .top { display:grid; grid-template-columns:1fr 48px 1fr; gap:8px; margin-bottom:12px; }
        .counter {
          height:46px; border:1px solid var(--divider-color,#444);
          border-radius:12px; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          background:var(--ha-card-background,var(--card-background-color,#1c1c1c));
        }
        .counter b { font-size:19px; }
        .counter small { font-size:9px; color:var(--secondary-text-color,#aaa); letter-spacing:.7px; }
        #new {
          height:46px; border:1px solid var(--divider-color,#444);
          border-radius:12px; background:var(--ha-card-background,var(--card-background-color,#1c1c1c));
          color:var(--primary-text-color); font-size:23px;
        }
        #board {
          display:grid; width:100%; max-width:100%; aspect-ratio:1/1; gap:2px; padding:3px;
          background:#0d0f12; border:1px solid var(--divider-color,#333);
          border-radius:10px; overflow:hidden; touch-action:manipulation;
        }
        .cell {
          width:100%; height:100%; min-width:0; min-height:0; padding:0;
          border:1px solid #343941; border-radius:3px; background:#252930;
          color:#eee; display:flex; align-items:center; justify-content:center;
          font:700 clamp(9px,3.2vw,19px)/1 sans-serif;
        }
        .cell.open { background:#191c21; border-color:#292d34; }
        .cell.mine { background:#f443363d !important; }
        .n1{color:#42a5f5}.n2{color:#66bb6a}.n3{color:#ef5350}
        .n4{color:#b39ddb}.n5{color:#ffb74d}.n6{color:#4dd0e1}
        .msg { min-height:22px; margin:8px 0; text-align:center; color:var(--secondary-text-color,#aaa); font-size:13px; }
        .buttons,.levels,.tabs { display:grid; gap:7px; }
        .buttons { grid-template-columns:1fr 1fr; }
        .levels,.tabs { grid-template-columns:repeat(3,1fr); margin-top:7px; }
        button {
          font-family:inherit; cursor:pointer; color:var(--primary-text-color);
          background:var(--ha-card-background,var(--card-background-color,#1c1c1c));
          border:1px solid var(--divider-color,#444); border-radius:10px; min-height:40px;
        }
        button.active {
          background:color-mix(in srgb,var(--primary-color,#03a9f4) 14%,transparent);
          border-color:var(--primary-color,#03a9f4); color:var(--primary-color,#03a9f4);
        }
        .row {
          display:grid; grid-template-columns:32px minmax(0,1fr) 58px; gap:8px;
          align-items:center; min-height:42px; border-bottom:1px solid var(--divider-color,#333);
          font-size:13px;
        }
        .row:last-child { border-bottom:0; }
        .rank { text-align:center; font-size:17px; }
        .name { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .time { text-align:right; font-weight:600; white-space:nowrap; }
        .leader .name { min-width:0; }
        .best {
          margin-top:10px; padding:9px 10px; border-radius:10px;
          background:color-mix(in srgb,var(--primary-color,#03a9f4) 9%,transparent);
          color:var(--secondary-text-color,#aaa); font-size:12px;
        }
        .empty { text-align:center; color:var(--secondary-text-color,#aaa); padding:18px 0; font-size:13px; }
        .error { color:var(--error-color,#f44336); }
        @media (max-width:700px) {
          .layout { grid-template-columns:1fr; }
          .wrap { padding:12px; }
          .leader { border-top:1px solid var(--divider-color,#333); padding-top:14px; }
        }
        @container (max-width:760px) {
          .layout { grid-template-columns:1fr; }
          .leader { border-top:1px solid var(--divider-color,#333); padding-top:14px; }
        }
      </style>
      <ha-card>
        <div class="wrap">
          <div class="layout">
            <section>
              <div class="title">💣 Hledání min</div>
              <div class="top">
                <div class="counter"><b id="mc">25</b><small>MINY</small></div>
                <button id="new" aria-label="Nová hra">🙂</button>
                <div class="counter"><b id="tm">0</b><small>ČAS</small></div>
              </div>
              <div id="board"></div>
              <div class="msg" id="msg">Klikni na políčko</div>
              <div class="buttons">
                <button id="reveal" class="active">👆 Odkrývat</button>
                <button id="flag">🚩 Vlajka</button>
              </div>
              <div class="levels">
                <button data-level="easy">Lehká</button>
                <button data-level="medium">Střední</button>
                <button data-level="hard">Těžká</button>
              </div>
            </section>
            ${this.showLeaderboard ? `
            <section class="leader">
              <div class="leader-title">🏆 Rekordy</div>
              <div class="tabs">
                <button data-tab="easy">Lehká</button>
                <button data-tab="medium">Střední</button>
                <button data-tab="hard">Těžká</button>
              </div>
              <div id="records" class="empty">Načítám…</div>
              <div id="best" class="best" style="display:none"></div>
            </section>` : ""}
          </div>
        </div>
      </ha-card>`;
    this.bind();
    this.syncButtons();
  }

  bind() {
    this.shadowRoot.getElementById("new").onclick = () => this.newGame();
    this.shadowRoot.getElementById("reveal").onclick = () => this.setMode("reveal");
    this.shadowRoot.getElementById("flag").onclick = () => this.setMode("flag");

    this.shadowRoot.querySelectorAll("[data-level]").forEach((button) => {
      button.onclick = () => this.selectLevel(button.dataset.level);
    });
    this.shadowRoot.querySelectorAll("[data-tab]").forEach((button) => {
      button.onclick = () => this.selectLevel(button.dataset.tab);
    });
  }

  selectLevel(level) {
    this.level = level;
    this.syncButtons();
    this.newGame();
    this.loadRecords();
  }

  syncButtons() {
    this.shadowRoot.querySelectorAll("[data-level]").forEach((x) => {
      x.classList.toggle("active", x.dataset.level === this.level);
    });
    this.shadowRoot.querySelectorAll("[data-tab]").forEach((x) => {
      x.classList.toggle("active", x.dataset.tab === this.level);
    });
  }

  setMode(mode) {
    this.mode = mode;
    this.shadowRoot.getElementById("reveal").classList.toggle("active", mode === "reveal");
    this.shadowRoot.getElementById("flag").classList.toggle("active", mode === "flag");
  }

  settings() {
    return {
      easy: [9, 9, 10],
      medium: [12, 12, 25],
      hard: [16, 16, 40],
    }[this.level];
  }

  newGame() {
    clearInterval(this.interval);
    this.interval = null;
    const [rows, cols, mines] = this.settings();
    this.rows = rows; this.cols = cols; this.mines = mines;
    this.board = Array.from({length: rows}, () =>
      Array.from({length: cols}, () => ({mine:false,open:false,flag:false,n:0}))
    );
    this.started = false; this.gameOver = false;
    this.flags = 0; this.opened = 0; this.timer = 0;
    this.shadowRoot.getElementById("tm").textContent = "0";
    this.shadowRoot.getElementById("mc").textContent = mines;
    this.shadowRoot.getElementById("msg").textContent = "Klikni na políčko";
    this.shadowRoot.getElementById("new").textContent = "🙂";
    this.draw();
  }

  placeMines(safeRow, safeCol) {
    let placed = 0;
    while (placed < this.mines) {
      const r = Math.floor(Math.random() * this.rows);
      const c = Math.floor(Math.random() * this.cols);
      if ((r === safeRow && c === safeCol) || this.board[r][c].mine) continue;
      this.board[r][c].mine = true;
      placed++;
    }

    for (let r=0;r<this.rows;r++) for (let c=0;c<this.cols;c++) {
      if (this.board[r][c].mine) continue;
      let n=0;
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
        if (!dr && !dc) continue;
        const rr=r+dr, cc=c+dc;
        if (rr>=0 && rr<this.rows && cc>=0 && cc<this.cols && this.board[rr][cc].mine) n++;
      }
      this.board[r][c].n=n;
    }
  }

  reveal(row,col) {
    if (this.gameOver) return;
    const cell=this.board[row][col];
    if (cell.open || cell.flag) return;

    if (!this.started) {
      this.placeMines(row,col);
      this.started=true;
      this.interval=setInterval(() => {
        this.timer++;
        this.shadowRoot.getElementById("tm").textContent=this.timer;
      },1000);
    }

    if (this.board[row][col].mine) {
      this.gameOver=true;
      clearInterval(this.interval);
      this.board.flat().forEach((x)=>{if(x.mine)x.open=true});
      this.shadowRoot.getElementById("msg").textContent="💥 Bum! Prohrál jsi.";
      this.shadowRoot.getElementById("new").textContent="😵";
      this.draw();
      return;
    }

    this.flood(row,col);
    if (this.opened >= this.rows*this.cols-this.mines) this.win();
    this.draw();
  }

  flood(startRow,startCol) {
    const queue=[[startRow,startCol]];
    const seen=new Set();
    while(queue.length){
      const [row,col]=queue.shift();
      const key=`${row},${col}`;
      if(seen.has(key))continue;
      seen.add(key);
      const cell=this.board[row][col];
      if(cell.open||cell.flag||cell.mine)continue;
      cell.open=true; this.opened++;
      if(cell.n===0){
        for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
          const rr=row+dr,cc=col+dc;
          if(rr>=0&&rr<this.rows&&cc>=0&&cc<this.cols)queue.push([rr,cc]);
        }
      }
    }
  }

  toggleFlag(row,col) {
    if(this.gameOver)return;
    const cell=this.board[row][col];
    if(cell.open)return;
    if(!cell.flag && this.flags>=this.mines)return;
    cell.flag=!cell.flag;
    this.flags += cell.flag ? 1 : -1;
    this.shadowRoot.getElementById("mc").textContent=this.mines-this.flags;
    this.draw();
  }

  async win() {
    this.gameOver=true;
    clearInterval(this.interval);
    this.board.flat().forEach((x)=>{if(x.mine)x.flag=true});
    this.flags=this.mines;
    this.shadowRoot.getElementById("mc").textContent="0";
    this.shadowRoot.getElementById("msg").textContent="🎉 Vyhrál jsi! Ukládám rekord…";
    this.shadowRoot.getElementById("new").textContent="😎";
    this.draw();

    const ok=await this.saveScore();
    this.shadowRoot.getElementById("msg").textContent=ok
      ? "🎉 Vyhrál jsi! Rekord uložen."
      : "🎉 Vyhrál jsi! Rekord se nepodařilo uložit.";
  }

  async saveScore() {
    try {
      if (!this._hass?.callApi) throw new Error("Home Assistant API is not available");
      const data = await this._hass.callApi(
        "POST",
        "minesweeper/records",
        {difficulty: this.level, time: this.timer},
      );
      this.records=data.records||[];
      this.myBest=data.record||null;
      this.updateLeaderboard();
      return true;
    }catch(error){
      console.error("Minesweeper: unable to save score", error);
      return false;
    }
  }

  async loadRecords() {
    if(!this.showLeaderboard)return;
    try{
      if (!this._hass?.callApi) throw new Error("Home Assistant API is not available");
      const data = await this._hass.callApi(
        "GET",
        `minesweeper/records?difficulty=${encodeURIComponent(this.level)}`,
      );
      this.records=data.records||[];
      this.myBest=data.my_best||null;
      this.updateLeaderboard();
    }catch(error){
      const records=this.shadowRoot.getElementById("records");
      if(records){
        records.className="empty error";
        records.textContent="Rekordy se nepodařilo načíst.";
      }
      console.error("Minesweeper: unable to load records",error);
    }
  }

  updateLeaderboard() {
    const records=this.shadowRoot.getElementById("records");
    if(!records)return;
    if(!this.records.length){
      records.className="empty";
      records.textContent="Zatím žádné rekordy.";
    }else{
      records.className="";
      records.innerHTML=this.records.map((record,index)=>`
        <div class="row">
          <div class="rank">${index<3?["🥇","🥈","🥉"][index]:index+1}</div>
          <div class="name">${this.escape(record.user_name)}</div>
          <div class="time">${record.time} s</div>
        </div>`).join("");
    }

    const best=this.shadowRoot.getElementById("best");
    if(best){
      if(this.myBest){
        best.style.display="block";
        best.textContent=`Tvůj nejlepší čas: ${this.myBest.time} s`;
      }else{
        best.style.display="none";
      }
    }
  }

  draw() {
    const board=this.shadowRoot.getElementById("board");
    if(!board)return;
    board.innerHTML="";
    board.style.gridTemplateColumns=`repeat(${this.cols},minmax(0,1fr))`;
    board.style.gridTemplateRows=`repeat(${this.rows},minmax(0,1fr))`;

    this.board.forEach((row,rowIndex)=>row.forEach((cell,colIndex)=>{
      const button=document.createElement("button");
      button.type="button";
      button.className=`cell${cell.open?" open":""}${cell.mine&&cell.open?" mine":""}${cell.open&&cell.n?" n"+cell.n:""}`;
      button.textContent=cell.mine&&cell.open?"💣":cell.flag?"🚩":cell.open&&cell.n?cell.n:"";
      button.setAttribute("aria-label",cell.flag?"Vlajka":cell.open?"Odkryté políčko":"Skryté políčko");
      button.onclick=()=>this.mode==="flag"
        ?this.toggleFlag(rowIndex,colIndex)
        :this.reveal(rowIndex,colIndex);
      button.oncontextmenu=(event)=>{event.preventDefault();this.toggleFlag(rowIndex,colIndex)};
      board.appendChild(button);
    }));
  }

  escape(value){
    return String(value??"").replace(/[&<>"']/g,(char)=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[char]));
  }
}

if (!customElements.get("minesweeper-card")) {
  customElements.define("minesweeper-card", MinesweeperCard);
}

window.customCards=window.customCards||[];
if(!window.customCards.some((card)=>card.type==="minesweeper-card")){
  window.customCards.push({
    type:"minesweeper-card",
    name:"Minesweeper",
    description:"Hledání min s leaderboardem pro Home Assistant",
    preview:true,
  });
}
