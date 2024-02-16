const article = document.querySelector("article");
// `document.querySelector` may return null if the selector doesn't match anything.
if (article) {
  const text = article.textContent;
  const wordMatchRegExp = /[^\s]+/g; // Regular expression
  const words = text!.matchAll(wordMatchRegExp);
  // matchAll returns an iterator, convert to array to get word count
  const wordCount = [...words].length;
  const readingTime = Math.round(wordCount / 200);
  const badge = document.createElement("p");
  // Use the same styling as the publish information in an article's header
  badge.classList.add("color-secondary-text", "type--caption");
  badge.textContent = `⏱️ ${readingTime} min read`;

  // Support for API reference docs
  const heading = article.querySelector("h1");
  // Support for article docs with date
  const date = article.querySelector("time")?.parentNode;

  ((date ?? heading) as Element).insertAdjacentElement("afterend", badge);
}

const getElmTransformY = (elm:Element) => {
    const y = elm.computedStyleMap().get("transform")?.toString();
    const matches = y?.match(/\d+/g);
    if(matches?.length !== 2) return 0;
    return parseInt(matches[1]);
}

const sleep = (ms:number) => new Promise(resolve => setTimeout(resolve,ms));

const sendPost = (url:string,data:Record<string,string>) => {
    let form = document.createElement("form");
    form.target = "_blank";
    form.method = "POST";
    form.action = url;
    form.style.display = "none";
    for(const key in data){
        let input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    // window.open("http://localhost:3000","_blank");
}


const main = async (post:chrome.runtime.Port) => {
    const timer = setInterval(domLoaded,1000);
    const usernames = new Map<number,string>();
    let userElmHeight = 0;
    let breakTimer = Date.now();let lastUserLength = 0;

    async function domLoaded(){
        let users = document.querySelectorAll("[data-testid='cellInnerDiv']");
        if(users.length > 0) {
            clearInterval(timer);
            //こっからスタート
            while(1){
                users = document.querySelectorAll("[data-testid='cellInnerDiv']");
                let lastElementTop = 0;
                users.forEach(async(elm,i) => {
                    const username = elm.querySelector("a")?.getAttribute("href");
                    const transformY = getElmTransformY(elm);
                    // User１つの高さ
                    if(userElmHeight == 0 && i == 0)userElmHeight = transformY;

                    if(username)usernames.set(transformY,username);
                    const elmHeight = elm.querySelector("a")?.getBoundingClientRect().top;
                    if(elmHeight)lastElementTop = elmHeight;
                    // scroll する
                    if(i === users.length - 1) {
                        document.documentElement.scrollTop = lastElementTop + window.scrollY;
                    }
                });
                if(lastUserLength !== users.length){
                    breakTimer = Date.now();
                    lastUserLength = users.length;
                }
                //3秒user数が増加しなかったらbreak
                if(Date.now() - breakTimer > 3000)break;
                await sleep(500);
                post.postMessage({size:usernames.size});
                console.log(usernames.size);
            }
            //全員分取得後
            const usernameArray:string[] = [];
            usernames.forEach((value) => {
                // "/"スタートなので成形
                usernameArray.push(value.slice(1));
            });
            console.log(usernameArray);
            window.open("https://noah.kazuryu.workers.dev/auth/post?usernames="+JSON.stringify(usernameArray));
            // sendPost("http://localhost:3000/post",{usernames:JSON.stringify(usernameArray)});


        }else {
            console.log("not loaded");
            console.log(users);
        }
    }
}


window.addEventListener("load",() => {
    document.body.style.backgroundColor = "red";
    chrome.runtime.onMessage.addListener(message => {
        console.log(message);
        if(message.type === "Click_button"){
            const port = chrome.runtime.connect({name:"progress"});
            main(port);
        }
        return true;
    })
},false);