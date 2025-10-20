import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  title!: string

  @Column()
  description!: string

  @Column()
  price!: number

  @Column({ type: 'json', default: [] })
  images!: string[]

  @Column({default: 0})
  sold!: number

  @Column({default: 1})
  continents!: number

  @Column({default: 0})
  views!: number

  @Column()
  writer!: number

  @Column({ type: 'json', default: [] })
  cart!: number[]

  @Column({ type: 'json', default: [] })
  history!: number[]
}