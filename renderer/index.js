const { ipcRenderer } = require("electron");
let allTracks = [], currentTrack = null, currentTarget = null;
const audio = document.getElementById("audio");
const bar = document.querySelector(".m-progress-bar");
const current_time = document.getElementById("current-time");
const duration_time = document.getElementById("duration-time");
const bottom_play_btn = document.getElementById("bottom-play-btn");
const music_name = document.getElementById("music-name");
const volume_btn = document.getElementById("volume-btn");
const volume_box = document.getElementById("volume-box");
const volume_num = document.getElementById("volume-num");

document.getElementById("add").addEventListener("click", e => {
    e.preventDefault();
    ipcRenderer.send("add");
});

bottom_play_btn.addEventListener("click", e => {
    e.preventDefault();
    if (currentTrack == null) return;
    if (audio.paused) {
        audio.play();
        playMusic();
    }
    else {
        audio.pause();
    }
})

ipcRenderer.on("init-data", (event, args) => {
    if(args.tracks){
        allTracks = args.tracks;
    }else{
        allTracks = args;
    }
    if(args.volume) changeVolume(args.volume);
    const list = document.getElementById("music-list");
    list.innerHTML = "";
    allTracks.forEach(obj => {
        list.append(createItem(obj));
    });

    document.querySelectorAll(".play-btn").forEach(node => {
        node.addEventListener("click", e => {
            e.preventDefault();
            const { id } = e.target.dataset;
            currentTarget = e.target;
            if (currentTrack == null || currentTrack.id != id) {
                currentTrack = allTracks.find(track => track.id === id);
                audio.src = currentTrack.path;
                music_name.innerHTML = currentTrack.fileName.split(".")[0];
                bar.style.width = 0;
            }
            if (audio.paused) {
                document.querySelectorAll(".play-btn").forEach(node => { node.innerHTML = "播放"; })
                audio.play();
            } else {
                audio.pause();
            }
            playMusic();
        });
    });

    document.querySelectorAll(".delete-btn").forEach(node => {
       
        node.addEventListener("click", e => {
            e.preventDefault();
            const { id } = e.target.dataset;
            if (currentTrack&&id === currentTrack.id) {
                audio.src = "";
                bar.style.width = 0;
                current_time.innerHTML = "00";
                duration_time.innerHTML = "00";
                currentTrack = null;
                currentTarget = null;
                music_name.innerHTML = "";
            }
            ipcRenderer.send("delete-music", id);
        });
    });
});



function changeVolume(n){
    audio.volume = n;
    volume_btn.style.left = n * 10 * 10 + "%";
    volume_num.style.width = n * 10 * 10 + "%";
}

volume_box.addEventListener("click", e => {
    e.preventDefault();
    if (e.target.id === volume_btn.id) return;
    let n = Math.min(Math.max((e.offsetX / volume_box.scrollWidth).toFixed(2),0),1);
    changeVolume(n);
    ipcRenderer.send("set-volume",n);
});

function playMusic() {
    window.requestAnimationFrame(() => {
        if (audio.readyState === 4) {
            if (audio.paused) {
                currentTarget.innerHTML = "播放";
                bottom_play_btn.classList.replace("icon-bofang", "icon-bofang1");
                return;
            }
            bar.style.width = (audio.currentTime / audio.duration) * 100 + "%";
            current_time.innerHTML = changeTime(audio.currentTime);
            duration_time.innerHTML = changeTime(audio.duration);
            bottom_play_btn.classList.replace("icon-bofang1", "icon-bofang");
            if (currentTarget) currentTarget.innerHTML = "暂停";

            // console.dir(audio.duration);
            // console.dir(audio.currentTime);
        } else {

            bottom_play_btn.classList.replace("icon-bofang", "icon-bofang1");
            if (currentTarget) currentTarget.innerHTML = "播放";
        }
        playMusic();
    })
}

function changeTime(n) {
    const t = ~~n;
    var m = ~~(t / 60) <= 9 ? "0" + ~~(t / 60) : ~~(t / 60);
    var s = t % 60 <= 9 ? "0" + ~~(t % 60) : ~~(t % 60);
    return m + ":" + s;
}

function createItem(obj) {
    const { fileName, id } = obj;
    const li = document.createElement("li");
    const div = document.createElement("div");
    const box = document.createElement("div");
    const playbtn = document.createElement("span");
    const deletebtn = document.createElement("span");
    li.className = "list-group-item"
    li.append(div)
    div.className = "row";
    div.innerHTML = `<div class="col-xs-9 music-item-left">${fileName.split(".")[0]}(格式：${fileName.split(".")[1]})</div>`;
    div.append(box);
    box.classList.add("col-xs-3", "music-item-right");
    playbtn.innerHTML = "播放";
    playbtn.dataset.id = id;
    playbtn.className = "play-btn";
    deletebtn.innerHTML = "删除";
    deletebtn.dataset.id = id;
    deletebtn.className = "delete-btn";
    box.append(playbtn, deletebtn);
    if (currentTrack && currentTrack.id === id) {
        currentTarget = playbtn;
    }
    return li;
}
