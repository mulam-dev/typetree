export default [{
    src: "json:boolean",
    input: "key:Enter",
    handle({src}) {
        src.act.toggle();
    },
}];