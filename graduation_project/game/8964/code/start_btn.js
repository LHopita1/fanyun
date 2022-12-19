const diffBtn = document.querySelectorAll(".sele");
const StartBtn = document.querySelector(".Start");
const RestartBtn = document.querySelector(".go_start_frame")

diffBtn[0].onclick = () => Class_list_change(0)
diffBtn[1].onclick = () => Class_list_change(1)
diffBtn[2].onclick = () => Class_list_change(2)

StartBtn.onclick = () => {
    (function () {
        const frame = new Frame({
            element: document.querySelector(".game-container"),
            diff: document.querySelector(".click")
        });
        document.querySelector(".Start-frame").style.display = "none";
        frame.init();
    }) ();
}

RestartBtn.onclick = () => {
    console.log(document.querySelector(".ReStart-frame"));
    document.querySelector(".ReStart-frame").style.display = "none";
    document.querySelector(".Start-frame").style.display = "block";
}

function Class_list_change(index) {
    for(var i = 0; i < diffBtn.length; i++) {
        if (i == index) {
            diffBtn[i].classList.add("click");
        }else {
            diffBtn[i].classList.remove("click");
        }
    }
}