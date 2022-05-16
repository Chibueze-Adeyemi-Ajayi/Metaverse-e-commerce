var provider = null, signer, copied_address, smartcontract, base_url;

const loader = $("#loader");

(async ()=>{
    try {
            provider = await new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner();
            //console.log(await provider.getNetwork())
            const wallet_adderss = signer.getAddress();
            $("#ic3 i").click();
    } catch (e) {provider = null;}
})();
connect_to_smartcontract();

//autoconnecting


function copy ()
{
    navigator.clipboard.writeText(copied_address);
    $("#copy-icon").attr("class", "fa fa-check");
    setTimeout(()=>{$("#copy-icon").attr("class", "fa fa-copy");}, 5000)
}

function getNFTUI (data, nft_id) 
{
    const price = (data.price > 0)? data.price + " ETH" : "",
          btn = (nft_id > -1)? 

          `<button id="btn`+ nft_id +`" onclick="mint('`+ nft_id +`', '`+ data.price +`',
           '`+ data.uri +`')" class="nft_btn">MINT</button>` 
           
                : 
           
          `<button id="btn`+ nft_id +`" onclick="alert('This feature needs official licensing from Meta, and that is what we are working towards.')" 
          class="nft_btn">Export to VR</button>`;

    const elem = 
    `<div id="grid-fragment" class="col-md-3">
        <b>`+ data.name +`</b><br>
        <img src="nft-assets/`+ data.url +`" style='width:100px;height:100px;margin-top:8px;'><br>
        <span>`+ price +`</span><br>
        `+ btn +`<br><br>
    </div>`;
    return elem;
}

async function loadMarketNFTs ()
{
    var marketUI = "";
    loader.fadeIn(async () => {
        //const nfts = await userNFTs(); console.log(nfts)
        $.get("../../Meta/nft-assets/assets.json", async (res, req) => {
          const assets = JSON.parse(JSON.stringify(res)),
                items = assets.items.sort((a,b)=>{
                  return 0.5 * Math.random();
                }); var x = 0;   
          items.forEach(async item => {x ++;
            const ui = getNFTUI(item, x);
            marketUI += ui;
          });       
          $("#market-zone").html(marketUI);
          console.log(assets);
        });
    });
}

async function loadNFTs ()
{
    try {

      $.post("../../Meta/nft-assets/json-generator/generator.php", null);
      $("#nft-panel").html("")

      loader.fadeIn(async () => {
        
        const nfts = await userNFTs(); loader.fadeIn();

        nfts[0].forEach(async nft => {loader.fadeIn();

          const uri = await smartcontract.tokenURI(nft),
                base_uri_length = base_url.length,
                nft_id = uri.toString().substring(base_uri_length),
                nft_uri = "../../Meta/nft-assets/" + nft_id;
                $.getJSON(nft_uri, json => {
                  const ui = getNFTUI(json, -1);
                  const html = $("#nft-panel").html();
                  $("#nft-panel").html(html + ui)
                });

        });
        loader.fadeOut();
      });

    } catch (e) {console.log(e)}

    finally {
      loader.fadeIn()
    }
}

function loadAssets ()
{
    loader.fadeIn(async () => {
        
        provider = await new ethers.providers.Web3Provider(window.ethereum);
        
        await provider.send("eth_requestAccounts", []);

        signer = await provider.getSigner();
        
        const wallet = await signer.getAddress(),
              balance = await signer.getBalance(),
              nfts = await userNFTs(),
              nft_count = nfts[0].length,
              asset_msg = nft_count > 1 ? "NFTs" : "NFT";

        $("#balance").html(ethers.utils.formatEther(balance.toString()) + " ETH");
        $("#address").html(wallet.toString().substring(0, 10) + "..");
        $("#asset").html(nft_count + " " + asset_msg);

        copied_address = wallet.toString();

        //connect with smart contract and populate numbers of NFTs

    });
}

$("#ic3 i").click();

function load (page)
{
    
    var web = (page == "wallet")? "wallet.html" :
                (page == "account")? "account.html" : "market-place.html";
    const id = (page == "wallet")? "#ic1 i" :
                (page == "account")? "#ic2 i" : "#ic3 i";

    if (provider == null) {
        web = "connection.html"
    }

    for (var i = 1; i < 4; i ++)
      $("#ic"+ i +" i").css({border:"0px", color:"#1752f3", background:"#fff"});

    const elem = $(id).css({"border-radius": "50%", border:"3px solid #1752f3", 
                             color:"#fff", background:"#1752f3"});

    loader.fadeIn();
    $("#page").load(web, () => {
        loader.fadeOut();
    });

}

function connect () {
    connect_to_metamask()
}

async function connect_to_metamask ()
{
   
    try {

        provider = await new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();

        if (window.location.toString().indexOf("market.html") > -1) return; 

    } catch (e) {
        console.log(e); provider = null;
    } finally {
        connection_btn.fadeIn();
        loader.fadeOut();
        
        $("#ic3 i").click();

    }
   
}

var network = null;

async function connect_to_smartcontract ()
{
    loader.fadeIn(async () => {

        provider = await new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        
        $.get("../../Meta/smartcontract/contract.json", async (res, req) =>
        {
            const contract_json = JSON.parse(JSON.stringify(res)),
                  abi = contract_json.abi,
                  contract_address = contract_json.address;
                  network = contract_json.network;
                  base_url = contract_json.uri;
                  smartcontract = await new ethers.Contract(contract_address, abi, signer);
            console.log("contract log: ", smartcontract);
            loader.fadeOut();
        });

    });
}

async function getNonce () {
  const nonce_ = await signer.getTransactionCount();
  return nonce_;
}
  
async function getGasPrice ()
{
  const price = await provider.getGasPrice();
  return price;
}
  
async function getChainId ()
{
  const network = await provider.getNetwork();
  return network.chainId;
}
  
async function getAddress ()
{
  const address = await signer.getAddress();
  return address;
}

async function getOverrides (nft_price)
{
    const nonce = await getNonce();
    const gasPrice = await getGasPrice();

    const overrides = {
      nonce: nonce,
      gasPrice: gasPrice,
      gasLimit: ethers.utils.hexlify("0x100000"),
      value: ethers.utils.parseEther(nft_price)
    }

    return overrides;
}

async function mint (nft_id, nft_price, nft_uri) {
    const btn = $("#btn" + nft_id);
    loader.fadeIn(async () => { 
      try {
     
         btn.fadeOut();
         var network_ = await provider.getNetwork();
             network_ = network_.name; nft_price = nft_price.toString();

         console.log(network_);

         const overrides = await getOverrides(nft_price),
               address = await getAddress(); console.log(overrides);

         const tx = await smartcontract.populateTransaction.mint(address, '1', nft_id, overrides);
         const signed_tx = await signer.sendTransaction(tx);
         if (!signed_tx) alert("OOps ")
         const receipt = await signed_tx.wait();

         if (receipt) alert("NFT successfully minted")
         else alert("Unable to mint NFT")

         console.log(overrides);

      } catch (e) {
        console.log(e)
      } finally {
        btn.fadeIn();
        loader.fadeOut();
      }

    }); 
}

async function userNFTs ()
{
    var output = null;
    try {

      const address_ = await getAddress(),
            nfts = await smartcontract.functions.walletOfOwner(address_);

      console.log(nfts); output = nfts;
      
    } catch (e) {output = null;console.log(e)}

    finally {
        return output;
    }
}
//userNFTs()
const connection_btn = $(".conn-btn");

connection_btn.on({
    click: async () =>
    {
        loader.fadeIn(() => {
            window.location = "market.html"});
        connection_btn.fadeOut()
    }
});
