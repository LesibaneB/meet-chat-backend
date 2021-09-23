export interface PreOfferAnswer {
  readonly callerId: string;
  readonly callType: 'voice' | 'video';
  readonly answer: 'accept' | 'reject';
}
