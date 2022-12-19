const Top_pixel = 50

window.onscroll = function() {
    if (document.body.scrollTop > Top_pixel || document.documentElement.scrollTop > Top_pixel)
        document.querySelector(".go_top").classList.remove("hidden")
    else
        document.querySelector(".go_top").classList.add("hidden")
}

function Go_Back_Top() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

