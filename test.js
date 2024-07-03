import axios from "axios";
axios.get("https://dummy.restapiexample.com/api/v1/employees").then((res) => {
    console.log('done\n', res);
}).catch((e) => console.log(e))