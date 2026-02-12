export const Component = {
  RestApplication: Symbol.for('RestApplication'),
  Logger: Symbol.for('Logger'),
  Config: Symbol.for('Config'),
  DatabaseClient: Symbol.for('DatabaseClient'),

  //User
  UserService: Symbol.for('UserService'),
  UserModel: Symbol.for('UserModel'),
  UserController: Symbol.for('UserController'),

  //Offer
  OfferService: Symbol.for('OfferService'),
  OfferModel: Symbol.for('OfferModel'),
  OfferController: Symbol.for('OfferController'),

  //Comment
  CommentService: Symbol.for('CommentService'),
  CommentModel: Symbol.for('CommentModel'),
  CommentController: Symbol.for('CommentController'),

  //Exception Filter
  ExceptionFilter: Symbol.for('ExceptionFilter'),
} as const;
