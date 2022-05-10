let input_w = document.querySelector('#watch_sel');
let textarea_w = document.querySelector('#watch_show');
let input_d = document.querySelector('#device_sel');
let textarea_d = document.querySelector('#device_show');

const watch = {
    idWatch: "0",
    urlWatch: "000"
};
const device = {
    idComponent: "0",
    urlComponent: "000",
    idParentWatch: "0"
};

const watches = [];
const devices = [];

input_w.addEventListener('change', ()=> {

    let files = input_w.files;

    if(files.length == 0) return;

    const file = files[0];
    let reader = new FileReader();

    reader.onload = (e) => {
        const file = e.target.result;
        const lines = file.split(/\r\n|\n/);
        for (i=0; i<lines.length-1;i++) {
            let infos = lines[i].split(",");
            let tmp_watch = {idWatch:infos[0], urlWatch:infos[1]}
            watches.push(tmp_watch)
        }
        for(w in watches) {
        textarea_w.value += watches[w].idWatch;
        textarea_w.value += '\t';
        textarea_w.value += watches[w].urlWatch;
        textarea_w.value += '\n';
    }
    };

    reader.onerror = (e) => alert(e.target.error.name);
    reader.readAsText(file)
});

input_d.addEventListener('change', ()=> {

    let files = input_d.files;

    if(files.length == 0) return;

    const file = files[0];
    let reader = new FileReader();

    reader.onload = (e) => {
        const file = e.target.result;
        const lines = file.split(/\r\n|\n/);
        for (i=0; i<lines.length-1; i++) {
            let infos = lines[i].split(",");
            let tmp_device = {idComponent:infos[0], urlComponent:infos[1], idParentWatch:infos[2]}
            devices.push(tmp_device)
        }
        for(d in devices) {
            textarea_d.value += devices[d].idComponent;
            textarea_d.value += '\t';
            textarea_d.value += devices[d].urlComponent;
            textarea_d.value += '\t';
            textarea_d.value += devices[d].idParentWatch;
            textarea_d.value += '\n';
        }
    };

    reader.onerror = (e) => alert(e.target.error.name);
    reader.readAsText(file)

});