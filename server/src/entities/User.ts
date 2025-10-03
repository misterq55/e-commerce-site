import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm'
import { IsEmail, Length } from 'class-validator'
import bcrypt from 'bcrypt'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  @IsEmail(undefined, { message: "이메일 주소가 잘못되었습니다" })
  email!: string

  @Column()
  @Length(6, 255, { message: "비밀번호는 6자 이상이어야 합니다" })
  password!: string // bcrypt로 해싱된 비밀번호

  @Column()
  @Length(2, 32, { message: "이름은 2자 이상 32자 이하이어야 합니다" })
  name!: string

  @Column({ default: 0 })
  role!: number

  @Column({ nullable: true })
  image?: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10)
  }
}
