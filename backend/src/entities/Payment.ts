import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Product } from "./Product";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User)
  user!: User

  @Column({ type: 'json' })
  data!: any[]

  @ManyToMany(() => Product)
  @JoinTable()
  products!: Product[]

  @CreateDateColumn()
  createdAt!: Date
}