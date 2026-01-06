export class CreateCommentDto {
  public text: string;
  public rating: number;
  public offerId: string;

  constructor(
    text: string,
    rating: number,
    offerId: string
  ) {
    this.text = text;
    this.rating = rating;
    this.offerId = offerId;
  }
}
