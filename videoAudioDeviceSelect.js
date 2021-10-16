
// Get camera and microphone
const videoElement = document.querySelector("video");
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");

audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

window.addEventListener('load', function () {
    getStream()
        .then(getDevices)
        .then(gotDevices);
});

function getDevices() {
    console.log("getDevices");
    return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
    console.log("gotDevices");
    window.deviceInfos = deviceInfos;
    console.log(deviceInfos);
    for (const deviceInfo of deviceInfos) {
        const option = document.createElement("option");
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === "audioinput") {
            option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
            audioSelect.appendChild(option);
        } else if (deviceInfo.kind === "videoinput") {
            option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        }
    }

    console.log(stream.getAudioTracks());
    // audioSelect.selectedIndex = [...audioSelect.options].findIndex(
    //   option => option.text === stream.getAudioTracks()[0].label
    // );
    videoSelect.selectedIndex = [...videoSelect.options].findIndex(
        option => option.text === stream.getVideoTracks()[0].label
    );
    console.log("videoSelect", videoSelect.selectedIndex);
}

function getStream() {
    console.log("getStream");
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    const audioSource = audioSelect.value;
    const videoSource = videoSelect.value;

    const constraints = {
        // audio: {
        //   deviceId: audioSource ? { exact: audioSource } : undefined,
        // },
        audio: false,
        video: {
            deviceId: videoSource ? { exact: videoSource } : undefined,
            //facingMode: "user", // 全面カメラアクセス
            //facingMode: { exact: "environment" }
            // width: { min: 320, ideal: 640, max: 1920 },
            // height: { min: 240, ideal: 480, max: 1080 }
        }
    };

    // const devices = await navigator.mediaDevices.enumerateDevices()
    // for (let i = 0; i < devices.length; i++) {
    //   document.getElementById('debug').innerHTML += (devices[i].deviceId + ',' + devices[i].label + ',' + devices[i].kind);
    // }


    //console.log(audioSource, constraints);
    return navigator.mediaDevices
        .getUserMedia(constraints)
        .then(gotStream)
        .catch(handleError);
}

function gotStream(stream) {
    console.log("gotStream");
    window.stream = stream;

    // audioSelect.selectedIndex = [...audioSelect.options].findIndex(
    //   option => option.text === stream.getAudioTracks()[0].label
    // );
    // videoSelect.selectedIndex = [...videoSelect.options].findIndex(
    //   option => option.text === stream.getVideoTracks()[0].label
    // );
    videoElement.srcObject = stream;

    // LEDがあるかどうかの確認と処理
    const track = stream.getVideoTracks()[0];

    //Create image capture object and get camera capabilities
    const imageCapture = new ImageCapture(track)
    const photoCapabilities = imageCapture.getPhotoCapabilities().then(() => {
        console.log("capabilities", track.getCapabilities());

        //todo: check if camera has a torch
        if (track.getCapabilities().torch) {
            //let there be light!
            const btn = document.querySelector('#button_led');
            btn.addEventListener('click', function () {
                track.applyConstraints({
                    advanced: [{ torch: true }]
                });
            });
        }
        else {
            const btn = document.querySelector('#button_led');
            btn.disabled = true;
        }
    });

}

function handleError(error) {
    console.error("Error: ", error);
}