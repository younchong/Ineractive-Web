import './style.css'
import { range, random, sortBy } from "lodash"
const app = document.querySelector<HTMLDivElement>('#app')!

function randomDNA(size: number) {
  return range(size).map(() => random(65, 122))
}

class Duplicant {
  dna: Array<number> = [];

  constructor(dna: Array<number>) {
    this.dna = dna;
  }

  diff(otherDNA: Array<number>) {
    return this.dna.map((it, key) => Math.abs(it - otherDNA[key])).reduce((a, b) => a + b);
  }

  toString() {
    return this.dna.map(it => String.fromCharCode(it)).join("") //유닛코드 to stirng
  }

  mutation(dna: Array<number>) {
    this.dna = dna.map((it, key) => {
      if (Math.random() <= 0.05) {
        return random(65, 122); // alphabet
      } else if (Math.random() > 0.5) {
        return this.dna[key];
      } else {
        return it;
      }
    })
  }
}

class Machine {
  target: string;
  targetDNA: Array<number> = [];
  duplicants: Array<Duplicant> = [];
  duplicantSize = 10;
  generation: number = 0;

  constructor(target: string) {
    this.target = target;
    this.targetDNA = this.target.split("").map(it => it.charCodeAt(0)); // string to utf-16 code

    for (let i = 0; i < this.duplicantSize; i++) {
      this.duplicants.push(new Duplicant(randomDNA(this.target.length)))
    }
  }

  generate() {
    this.generation++;
    const score = this.duplicants.map((it, key) => ({
      id: key,
      dna: it.dna,
      score: it.diff(this.targetDNA),
      value: it.toString()
    }))

    const sortedScore = sortBy(score, "score") // score 기준으로 정렬됨

    const bestScore = sortedScore[0];
    console.log(this.generation);
    console.log(bestScore.value);

    this.duplicants.map(it => {
      it.mutation(bestScore.dna);
    });
  }
}

const m = new Machine("younchong");

setInterval(() => {
  m.generate()
},50)
