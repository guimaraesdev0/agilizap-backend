import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    ForeignKey,
    BelongsTo,
    HasMany,
    AutoIncrement,
    Default,
    BeforeCreate,
    BelongsToMany,
    AllowNull
  } from "sequelize-typescript";
  import User from "./User";
  import Ticket from "./Ticket"

  @Table
  class UsersInTickets extends Model<UsersInTickets> 
  {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;

    @ForeignKey(() => User)
    @Column
    userId: number;
  
    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Ticket)
    @Column
    ticketId: number;

    @BelongsTo(() => Ticket)
    ticket: Ticket

  }

  export default UsersInTickets;