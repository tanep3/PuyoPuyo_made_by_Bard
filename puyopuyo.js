// グローバル変数
let ctx;

// グローバル定数
const PUYO_COLORS = ["blue", "green", "red", "purple", "yellow"];
const FIELD_WIDTH = 350;
const FIELD_HEIGHT = 640;
const BOARD_WIDTH = 6;
const BOARD_HEIGHT = 13;
const PUYO_SIZE_WIDTH = FIELD_WIDTH / BOARD_WIDTH;
const PUYO_SIZE_HEIGHT = FIELD_HEIGHT / BOARD_HEIGHT;
const APPEAR_X = 2;
const APPEAR_Y = 0;
let auto_fall_time = 500;
const DELETE_TIME = 100;
let puyoPuyo = null;

class Puyo {
    constructor() {
        this.color = PUYO_COLORS[Math.floor(Math.random() * PUYO_COLORS.length)];
        this.group_number = null;
        this.is_same_color = false;
    }

    draw(x, y) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(x * PUYO_SIZE_WIDTH + (PUYO_SIZE_WIDTH / 2), y * PUYO_SIZE_HEIGHT + (PUYO_SIZE_HEIGHT / 2), PUYO_SIZE_WIDTH / 2, PUYO_SIZE_HEIGHT / 2, 0, 2 * Math.PI, false);
        // ぷよを塗りつぶす
        ctx.fill();
    }
}

class Field {
    constructor() {
        this.board = new Array(BOARD_WIDTH);
        for (let i = 0; i < BOARD_WIDTH; i++) {
            this.board[i] = new Array(BOARD_HEIGHT);
            for (let j = 0; j < BOARD_HEIGHT; j++) {
                this.board[i][j] = null;
            }
        }
    }

    put(puyo, x, y) {
        this.board[x][y] = puyo;
    }

    delete(x, y) {
        this.board[x][y] = null;
    }

    draw() {
        ctx.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
        for (let i = 0; i < BOARD_WIDTH; i++) {
            for (let j = 0; j < BOARD_HEIGHT; j++) {
                if (this.board[i][j] !== null) {
                    this.board[i][j].draw(i, j);
                }
            }
        }
    }

    puyoGrouping() {
        for (let i = 0; i < BOARD_WIDTH; i++) {
            for (let j = 0; j < BOARD_HEIGHT; j++) {
                if (this.board[i][j] !== null) {
                    this.board[i][j].group_number = 0;
                    this.board[i][j].is_same_color = false;
                }
            }
        }
        let group_number = 1;
        for (let j = 0; j < BOARD_HEIGHT; j++) {
            for (let i = 0; i < BOARD_WIDTH; i++) {
                if (this.board[i][j] !== null) {
                    this.puyoGroup(i, j, this.board[i][j].color);
                    if (this.numbering(group_number)) group_number++;
                }
            }
        }
    }

    puyoGroup(x, y, color) {
        if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) return;
        if (this.board[x][y] === null || this.board[x][y].color !== color) return;
        if (this.board[x][y].is_same_color) return;

        this.board[x][y].is_same_color = true;

        //左
        this.puyoGroup(x - 1, y, color);
        //右
        this.puyoGroup(x + 1, y, color);
        //上
        this.puyoGroup(x, y - 1, color);
        //下
        this.puyoGroup(x, y + 1, color);
    }

    numbering(gnumber) {
        let flg_numbering = false;
        for (let i = 0; i < BOARD_WIDTH; i++) {
            for (let j = 0; j < BOARD_HEIGHT; j++) {
                if (this.board[i][j] !== null && this.board[i][j].is_same_color) {
                    this.board[i][j].group_number = gnumber;
                    this.board[i][j].is_same_color = false;
                    flg_numbering = true;
                }
            }
        }
        return flg_numbering;
    }

    puyoClear() {
        let deleted = false;
        let count = new Array(BOARD_WIDTH * BOARD_HEIGHT).fill(0);
        for (let i = 0; i < BOARD_WIDTH; i++) {
            for (let j = 0; j < BOARD_HEIGHT; j++) {
                if (this.board[i][j] !== null) {
                    count[this.board[i][j].group_number]++;
                }
            }
        }
        for (let i = 0; i < BOARD_WIDTH; i++) {
            for (let j = 0; j < BOARD_HEIGHT; j++) {
                if (this.board[i][j] !== null) {
                    if (count[this.board[i][j].group_number] >= 4) {
                        this.delete(i, j);
                        deleted = true;
                    }
                }
            }
        }
        return deleted;
    }

    puyoDown(x, y) {
        if (this.board[x][y] !== null) {
            if (this.board[x][y + 1] === null) {
                this.board[x][y + 1] = this.board[x][y];
                this.board[x][y] = null;
                return true;
            }
        }
        return false;
    }

    allPuyoDown() {
        let deleted = false;
        for (let j = BOARD_HEIGHT - 1; j >= 0; j--) {
            for (let i = 0; i < BOARD_WIDTH; i++) {
                if (this.board[i][j] !== null) {
                    while (this.puyoDown(i, j)) {
                        deleted = true;
                    }
                }
            }
        }
        return deleted;
    }

    isBlankfield() {
        let isBlank = false;
        for (let j = BOARD_HEIGHT - 2; j >= 0; j--) {
            for (let i = 0; i < BOARD_WIDTH; i++) {
                if (this.board[i][j] !== null) {
                    if (this.board[i][j + 1] === null) {
                        isBlank = true;
                    }
                }
            }
        }
        return isBlank;
    }
}

class PuyoPuyo {
    constructor(field) {
        this.puyo = [new Puyo(), new Puyo()];
        this.puyo_x = [APPEAR_X, APPEAR_X + 1];
        this.puyo_y = [APPEAR_Y, APPEAR_Y];
        this.field = field;
        this.rotate_state = 0;
    }

    put() {
        for (let i = 0; i < 2; i++) {
            this.field.put(this.puyo[i], this.puyo_x[i], this.puyo_y[i]);
        }
    }

    delete() {
        for (let i = 0; i < 2; i++) {
            this.field.delete(this.puyo_x[i], this.puyo_y[i]);
        }
    }

    moveLeft() {
        this.delete();
        for (let i = 0; i < 2; i++) {
            this.puyo_x[i]--;
        }
        if (this.isCollision()) {
            for (let i = 0; i < 2; i++) {
                this.puyo_x[i]++;
            }
            this.put();
            return false;
        }
        this.put();
        return true;
    }

    moveRight() {
        this.delete();
        for (let i = 0; i < 2; i++) {
            this.puyo_x[i]++;
        }
        if (this.isCollision()) {
            for (let i = 0; i < 2; i++) {
                this.puyo_x[i]--;
            }
            this.put();
            return false;
        }
        this.put();
        return true;
    }

    moveDown() {
        this.delete();
        for (let i = 0; i < 2; i++) {
            this.puyo_y[i]++;
        }
        if (this.isCollision()) {
            for (let i = 0; i < 2; i++) {
                this.puyo_y[i]--;
            }
            this.put();
            return false;
        }
        this.put();
        return true;
    }

    rotate() {
        let temp_x = this.puyo_x[1];
        let temp_y = this.puyo_y[1];
        this.delete();
        if (this.rotate_state === 0) {
            this.puyo_x[1] = this.puyo_x[0];
            this.puyo_y[1] = this.puyo_y[0] + 1;
        } else if (this.rotate_state === 1) {
            this.puyo_x[1] = this.puyo_x[0] - 1;
            this.puyo_y[1] = this.puyo_y[0];
        } else if (this.rotate_state === 2) {
            this.puyo_x[1] = this.puyo_x[0];
            this.puyo_y[1] = this.puyo_y[0] - 1;
        } else if (this.rotate_state === 3) {
            this.puyo_x[1] = this.puyo_x[0] + 1;
            this.puyo_y[1] = this.puyo_y[0];
        }
        if (this.isCollision()) {
            this.puyo_x[1] = temp_x;
            this.puyo_y[1] = temp_y;
            this.put();
            return false;
        }
        this.put();
        this.rotate_state++;
        if (this.rotate_state >= 4) this.rotate_state = 0;
        return true;
    }

    isCollision() {
        for (let i = 0; i < 2; i++) {
            if (
                this.puyo_x[i] < 0 ||
                this.puyo_x[i] >= BOARD_WIDTH ||
                this.puyo_y[i] < 0 ||
                this.puyo_y[i] >= BOARD_HEIGHT ||
                this.field.board[this.puyo_x[i]][this.puyo_y[i]] !== null
            ) {
                return true;
            }
        }
        return false;
    }

    isGameOver() {
        for (let i = APPEAR_X; i <= APPEAR_X + 1; i++) {
            if (this.field.board[i][0] !== null) {
                return true;
            }
        }
        return false;
    }
}


function keyInput(e) {
    // キー入力の処理関数
    const key = e.keyCode;
    if (key === 37) { // 左キー
        puyoPuyo.moveLeft();
    } else if (key === 39) { // 右キー
        puyoPuyo.moveRight();
    } else if (key === 40) { // 下キー
        puyoPuyo.moveDown();
    }
    // ぷよぷよの操作（移動、回転など）
    //    if (key === 32) { // スペースキー
    if (key === 38) { // 上キー
        puyoPuyo.rotate();
    }
}

function main() {
    // グローバル変数と定数の初期化
    ctx = document.getElementById("canvas").getContext("2d");

    // Fieldクラスのインスタンスを作成
    const field = new Field();

    // ぷよぷよを配置
    puyoPuyo = new PuyoPuyo(field);
    // イベントリスナーの登録
    document.addEventListener("keydown", keyInput);
    puyoPuyo.put();

    // ローカル変数の宣言
    let frame = 0;
    let flg_gameover = false;
    let flg_is_moveDown = true;

    // ループ関数
    function loop() {
        if (flg_is_moveDown) {
            // ぷよぷよの落下処理
            if ((frame * 1000 / 60) % auto_fall_time === 0) {
                flg_is_moveDown = puyoPuyo.moveDown();
            }
        } else {
            if ((frame * 1000 / 60) % DELETE_TIME === 0) {
                puyoPuyo = null;
                if (field.isBlankfield()) {
                    field.allPuyoDown()
                } else {
                    // ぷよぷよのグループ化と消去処理
                    field.puyoGrouping();
                    if (!field.puyoClear()) {
                        // すべてのイベントリスナーを削除する
                        document.removeEventListener("keydown", null, false);
                        // 新しいぷよを生成
                        puyoPuyo = new PuyoPuyo(field);
                        // イベントリスナーの登録
                        document.addEventListener("keydown", keyInput);

                        if (puyoPuyo.isGameOver()) {
                            alert("ゲームオーバー");
                            flg_gameover = true;
                        } else {
                            puyoPuyo.put();
                            flg_is_moveDown = true;
                        }
                    }
                }
            }
        }

        // フィールドの描画
        field.draw();

        // フレームカウントアップ
        frame++;
        // 60フレームごとにクリア
        if (frame >= 60) {
            frame = 0;
        }

        // ゲームオーバー判定
        if (flg_gameover) {
            alert("ゲームオーバー");
        } else {
            // 1フレーム待ち
            requestAnimationFrame(loop);
        }
    }

    // ループ開始
    requestAnimationFrame(loop);
}

window.onload = main;
