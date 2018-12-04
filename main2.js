const SHA256 = require(process.cwd() + '/node_modules/crypto-js/sha256');

class Transaction{
  constructor(fromAddress, toAddress, amount){
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

class Block{
  constructor(timestamp, transactions, previousHash = ''){
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }
  calculateHash(){
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }
  mineBlock(difficulty){
    while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain{
  constructor(){
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }
  createGenesisBlock(){
    console.log("Creating genesis block...")
    return new Block(Date.now(), "Marcs first chain", "0")
  }
  getLatestBlock(){
    return this.chain[this.chain.length - 1];
  }
  minePendingTransactions(miningRewardAddress){
    let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash); // which transactions will be included?
    block.mineBlock(this.difficulty);
    this.chain.push(block);

    if(this.chain.length % 5 === 0){
      this.miningReward -= Math.floor(this.miningReward * 0.05);
    }

    this.pendingTransactions = [
    new Transaction(null, miningRewardAddress, this.miningReward)
    ];
  }
  createTransaction(transaction){
    this.pendingTransactions.push(transaction);
  }
  getBalanceOfAddress(address){
    let balance = 0;

    for(const block of this.chain){
      for(const trans of block.transactions){
        if(trans.fromAddress === address){
          balance -= trans.amount;
        }
        if(trans.toAddress === address){
          balance += trans.amount;
        }
      }
    }
    return balance;
  }
  isChainValid(){
    for(let i = 1; i < this.chain.length; i++){
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      if(currentBlock.hash !== currentBlock.calculateHash()){
        return false;
      }
      if(currentBlock.previousHash !== previousBlock.hash){
        return false;
      }
    }
    return true;
  }
}

// TESTING CHAIN:

let marcCoin = new Blockchain();
const requestedChainLength = 30;

while(marcCoin.chain.length < requestedChainLength){

  marcCoin.createTransaction(new Transaction('address 1', 'address 2', Math.floor(Math.random() * 1000)));
  marcCoin.createTransaction(new Transaction('address 1', 'address 2', Math.floor(Math.random() * 1000)));
  marcCoin.createTransaction(new Transaction('address 1', 'address 2', Math.floor(Math.random() * 1000)));
  marcCoin.createTransaction(new Transaction('address 1', 'address 2', Math.floor(Math.random() * 1000)));

  marcCoin.minePendingTransactions('minerAddress');

  console.log('Block no.', marcCoin.chain.length, 'mined!');
  console.log('  Balance of miner is ', marcCoin.getBalanceOfAddress('minerAddress'));
}

console.log("");
console.log("----------------------------------------");
console.log("");

console.log(marcCoin);

