const SHA256 = require(process.cwd() + '/node_modules/crypto-js/sha256');

class Transaction{
  constructor(fromAddress, toAddress, amount, fee = 0){
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.fee = fee;
  }
}

class Block{
  constructor(timestamp, transactions, previousHash = ''){
    this.timestamp = timestamp;
    this.transactions = transactions.slice(0, 5);
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
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }
  createGenesisBlock(){
    return new Block(Date.now(), ["Marcs first chain"], "0");
    console.log("Genesis block created!");
  }
  getLatestBlock(){
    return this.chain[this.chain.length - 1];
  }
  minePendingTransactions(miningRewardAddress){
    let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);
    this.chain.push(block);
    if(this.chain.length % 5 === 0){
      this.miningReward -= Math.floor(this.miningReward * 0.05);
    }
    this.pendingTransactions.splice(0, 5);
    this.pendingTransactions.push(new Transaction(null, miningRewardAddress, this.miningReward, 11));
  }

  createTransaction(transaction){
    this.pendingTransactions.push(transaction);
    this.sortPendingTransactions();
  }
  sortPendingTransactions(){
    this.pendingTransactions = this.pendingTransactions.sort(function(a, b){return b.fee - a.fee});
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
const requestedChainLength = 12;

while(marcCoin.chain.length < requestedChainLength){
  let transactionAmount = 5 + Math.floor(Math.random() * 30)

  for(let i = 0; i < transactionAmount; i++){
    marcCoin.createTransaction(new Transaction('address 1', 'address 2', Math.floor(Math.random() * 1000), Math.floor(Math.random() * 10)));
  }

  marcCoin.minePendingTransactions('minerAddress');

  let currentBlock = marcCoin.chain[marcCoin.chain.length - 1];
  let currentBlockTransactionList = currentBlock.transactions
  let currentBlockTransactionAmountArray = []
  for(const transaction of currentBlockTransactionList){
    currentBlockTransactionAmountArray.push(transaction.amount);
  }

  let currentBlockTransactionAmount = 0;
  for (let i = 0; i < currentBlockTransactionAmountArray.length; i++) {
    currentBlockTransactionAmount += currentBlockTransactionAmountArray[i];
  }

  console.log('');
  console.log('  Timestamp:', currentBlock.timestamp);
  console.log('  Hash:', currentBlock.hash);
  console.log('  Previous hash:', currentBlock.previousHash);
  console.log('  Amount of transactions:', currentBlockTransactionList.length);
  console.log('  Sum of transactions:', currentBlockTransactionAmount);
  console.log('  Transactions:\n', currentBlockTransactionList);
  console.log('  Current miner balance:', marcCoin.getBalanceOfAddress('minerAddress'));
}

console.log('');
console.log('Amount of outstanding transactions:', marcCoin.pendingTransactions.length);
