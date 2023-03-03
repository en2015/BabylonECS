export default class SparseSet {
    

    private sparse: Uint32Array;
    private dense: Uint32Array;
    private count: number;
    private capacity: number;
    private maxValue: number;

    constructor(maxValue: number, capacity: number) {    
        this.sparse = new Uint32Array(maxValue + 1);
        this.dense = new Uint32Array(capacity); 
        this.capacity = capacity;
        this.maxValue = maxValue;
        this.count = 0;
    }

    has(value: number) {
        return (this.dense[this.sparse[value]] === value);
    }

    insert(value: number) {
       
        if(this.has(value)) {
            return;
        }

        this.dense[this.count] = value;
        this.sparse[value] = this.count;

        this.count++;
    }

    delete(value: number) {
        
        if(!this.has(value)) {
            return;
        }

        const temp = this.dense[this.count - 1];
        this.dense[this.sparse[value]] = temp;
        this.dense[this.count - 1] = 0;
        
        this.sparse[temp] = this.sparse[value];
        this.sparse[value] = 0;

        this.count--;
    }

    print() {
        for(let i = 0; i < this.capacity; i++) {
            console.log(this.dense[i]);
        }
    }

    getValues() {
        return this.dense;
    }

    length() {
        return this.count;
    }

    getCapacity() {
        return this.capacity;
    }

    getDenseId(value: number) {
        return this.sparse[value];
    }

    getSparseId(value: number) {
        return this.dense[value];
    }

    getLastInsertion() {
        return this.count - 1;
    }
}