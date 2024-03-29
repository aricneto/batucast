import Database from "../database";
import BaseEntity from "../entities/base.entity";
import { HttpInternalServerError } from "../utils/errors/http.error";
import { v4 as uuidv4 } from "uuid";
import { validate } from "class-validator";

type FilterFunction<T> = (item: T) => boolean;

export default class BaseRepository<T extends BaseEntity> {
  private prefix: string;
  private db: Database;

  constructor(prefix: string) {
    this.prefix = prefix;
    this.db = Database.getInstance();
  }

  private async validateData(data: T): Promise<void> {
    const errors = await validate(data);
    if (errors.length > 0) {
      throw new TypeError("Data is incomplete or not of the correct type");
    }
  }

  public async add(data: T): Promise<T> {
    try {
      await this.validateData(data);

      if (!this.db.data[this.prefix]) {
        this.db.data[this.prefix] = [];
      }
      const newItem = {
        ...data,
        id: data.id || uuidv4(), // if id is not provided, generate a new one. careful! this will change the id of the object.
      };
      this.db.data[this.prefix].push(newItem);
      return newItem;
    } catch (e) {
      throw e;
    }
  }

  public async update(
    filter: FilterFunction<T>,
    data: Partial<T>
  ): Promise<T | null> {
    try {
      if (!this.db.data[this.prefix]) {
        return null;
      }
      const item = this.db.data[this.prefix].find(filter);
      if (item) {
        //delete data.id;
        Object.assign(item, data);
        return item;
      }
      return null;
    } catch (e) {
      throw new HttpInternalServerError();
    }
  }

  public async findOne(filter: FilterFunction<T>): Promise<T | null> {
    try {
      if (!this.db.data[this.prefix]) {
        return null;
      }
      return this.db.data[this.prefix].find(filter) || null;
    } catch (e) {
      throw new HttpInternalServerError();
    }
  }

  public async findAll(filter?: FilterFunction<T>): Promise<T[]> {
    try {
      if (!this.db.data[this.prefix]) {
        return [];
      }
      return filter
        ? this.db.data[this.prefix].filter(filter)
        : this.db.data[this.prefix];
    } catch (e) {
      throw new HttpInternalServerError();
    }
  }

  public async delete(filter: FilterFunction<T>): Promise<void> {
    try {
      if (!this.db.data[this.prefix]) {
        return;
      }

      this.db.data[this.prefix] = this.db.data[this.prefix].filter(filter);
    } catch (e) {
      throw new HttpInternalServerError();
    }
  }
}
