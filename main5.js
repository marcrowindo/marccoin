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
  constructor(timestamp, miningRewardTransaction = 0, transactions, previousHash = ''){
    this.blockSize = 20;
    this.timestamp = timestamp;
    this.miningRewardTransaction = miningRewardTransaction;
    this.transactions = transactions.splice(0, this.blockSize);
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
    this.miningRewardTransaction = null;
    this.miningReward = 100;
  }
  createGenesisBlock(){
    return new Block(Date.now(), ["Marcs first chain"], "0");
  }
  getLatestBlock(){
    return this.chain[this.chain.length - 1];
  }
  minePendingTransactions(miningRewardAddress){
    console.log("--------------------------", this.pendingTransactions);

    let block = new Block(Date.now(), this.miningRewardTransaction, this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);
    this.chain.push(block);
    if(this.chain.length % 5 === 0){
      this.miningReward -= Math.floor(this.miningReward * 0.05);
    }
    this.miningRewardTransaction = new Transaction(null, miningRewardAddress, this.miningReward);
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

let marcChain = new Blockchain();
const requestedChainLength = 12;

while(marcChain.chain.length < requestedChainLength){
  let transactionAmount = 5 + Math.floor(Math.random() * 30);

  for(let i = 0; i < transactionAmount; i++){
    marcChain.createTransaction(new Transaction('address 1', 'address 2', Math.floor(Math.random() * 1000), Math.floor(Math.random() * 10)));
  }

  marcChain.minePendingTransactions('minerAddress');

  let currentBlock = marcChain.chain[marcChain.chain.length - 1];
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

  console.log('  Miner reward transaction:\n', currentBlock.miningRewardTransaction);

  console.log('  Sum of transactions:', currentBlockTransactionAmount);
  console.log('  Transactions:\n', currentBlockTransactionList);
  console.log('  Current miner balance:', marcChain.getBalanceOfAddress('minerAddress'));
}

console.log('');
console.log('Amount of outstanding transactions:', marcChain.pendingTransactions.length);
