var HANDS = ["✊", "✌️", "✋"];

// ゲームの状態を管理する変数
var coins      = 1;       // 所持コイン
var cpuHand    = "";      // CPUの手
var isPlaying  = false;   // プレイ中かどうか

// 各スロットの状態
var isSpinning  = [false, false, false]; // 回転中か
var intervalIds = [null,  null,  null ]; // タイマーID
var slotValues  = ["✊",  "✊",  "✊" ]; // 現在の絵柄
var stoppedCount = 0;                    // 止まった数

var handIndexes = [0, 1, 2];

// スロット要素・ボタン要素
var $slots = [$("#slot1"), $("#slot2"), $("#slot3")];
var $stops = [$("#stop1"), $("#stop2"), $("#stop3")];

// 初期表示
updateCoinsDisplay();
$stops[0].prop("disabled", true);
$stops[1].prop("disabled", true);
$stops[2].prop("disabled", true);

// ボタンのクリックイベント
$("body > button").on("click", startGame);

$stops[0].on("click", function() { stopSlot(0); });
$stops[1].on("click", function() { stopSlot(1); });
$stops[2].on("click", function() { stopSlot(2); });

//  所持コインの表示を更新する
function updateCoinsDisplay() {
  $(".coin > div").eq(1).find("p:last-child").text(coins + "枚");
}

//  CPUの手に勝てる手を返す
function winningHand(cpu) {
  if (cpu === "✊") return "✋";
  if (cpu === "✌️") return "✊";
  if (cpu === "✋") return "✌️";
  return "";
}

//  CPUの手に負ける手を返す（没収判定用）
function losingHand(cpu) {
  if (cpu === "✊") return "✌️";
  if (cpu === "✌️") return "✋";
  if (cpu === "✋") return "✊";
  return "";
}

//  コインが多い → 速くなる
function calcSpeed() {
  var speed = 600 - (coins * 50);
  if (speed < 80) speed = 80;
  return speed;
}

//  ゲーム開始
function startGame() {
  if (isPlaying) return;
  isPlaying    = true;
  stoppedCount = 0;
  isSpinning   = [true, true, true];

  // ★ 各スロットのスタート位置をバラバラにリセット
  handIndexes = [0, 1, 2];

  // CPUの手をランダムに決める
  var index = Math.floor(Math.random() * HANDS.length);
  cpuHand = HANDS[index];

  // CPUの手を画面に表示
  $(".hand").text(cpuHand);

  // 結果表示をリセット
  $(".coin > div").eq(0).find("p:last-child").text("－");

  // プレイボタンを無効化、STOPボタンを有効化
  $("body > button").prop("disabled", true);
  $stops[0].prop("disabled", false);
  $stops[1].prop("disabled", false);
  $stops[2].prop("disabled", false);

  // スロットを回し始める
  var speed = calcSpeed();
  startSlot(0, speed);
  startSlot(1, speed);
  startSlot(2, speed);
}

//  スロットを回し始める
function startSlot(i, speed) {
  intervalIds[i] = setInterval(function() {
    // 今の絵柄を表示
    slotValues[i] = HANDS[handIndexes[i]];
    $slots[i].text(slotValues[i]);

    handIndexes[i] = (handIndexes[i] + 1) % HANDS.length;
  }, speed);
}

//  スロットを止める
function stopSlot(i) {
  if (!isSpinning[i]) return;

  clearInterval(intervalIds[i]);
  isSpinning[i] = false;
  stoppedCount++;

  $stops[i].prop("disabled", true);

  // 3つ全部止まったら判定へ
  if (stoppedCount === 3) {
    judgeResult();
  }
}

//  勝敗判定
function judgeResult() {
  var winning = winningHand(cpuHand);
  var losing  = losingHand(cpuHand);

  var winCount  = 0;
  var loseCount = 0;

  if (slotValues[0] === winning) winCount++;
  if (slotValues[1] === winning) winCount++;
  if (slotValues[2] === winning) winCount++;

  if (slotValues[0] === losing) loseCount++;
  if (slotValues[1] === losing) loseCount++;
  if (slotValues[2] === losing) loseCount++;

  var coinChange = 0;
  var message    = "";

  if (winCount === 3) {
    coinChange = 3;
    message = "+" + coinChange + "枚獲得！🎉";
  } else if (winCount === 2) {
    coinChange = 2;
    message = "+" + coinChange + "枚獲得！✨";
  } else if (winCount === 1) {
    coinChange = 1;
    message = "+" + coinChange + "枚獲得！";
  } else {
    coinChange = -loseCount;
    if (loseCount > 0) {
      message = "-" + loseCount + "枚没収…😢";
    } else {
      message = "引き分け！±0枚";
    }
  }

  coins += coinChange;
  if (coins < 0) coins = 0;

  $(".coin > div").eq(0).find("p:last-child").text(message);
  updateCoinsDisplay();

  if (coins <= 0) {
    setTimeout(function() {
      alert("💀 コインがなくなった！ゲームオーバー");
      resetGame();
    }, 400);
    return;
  }

  if (coins >= 10) {
    setTimeout(function() {
      alert("🎊 コインが10枚になった！あなたの勝ち！");
      resetGame();
    }, 400);
    return;
  }

  isPlaying = false;
  $("body > button").prop("disabled", false);
  $stops[0].prop("disabled", true);
  $stops[1].prop("disabled", true);
  $stops[2].prop("disabled", true);
}

//  ゲームリセット
function resetGame() {
  coins        = 1;
  isPlaying    = false;
  stoppedCount = 0;
  slotValues   = ["✊", "✊", "✊"];
  isSpinning   = [false, false, false];
  handIndexes  = [0, 1, 2];

  $slots[0].text("✊");
  $slots[1].text("✊");
  $slots[2].text("✊");
  $(".hand").text("✊");
  $(".coin > div").eq(0).find("p:last-child").text("－");

  updateCoinsDisplay();
  $("body > button").prop("disabled", false);
  $stops[0].prop("disabled", true);
  $stops[1].prop("disabled", true);
  $stops[2].prop("disabled", true);
}