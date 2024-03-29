import { makeExecutableSchema } from "@graphql-tools/schema";
import { scalarResolvers } from "./resolvers";

const schema = makeExecutableSchema({
  typeDefs: `
    scalar PublicKey
    scalar BigNumber
    scalar Hash
    
    enum AuctionState {
      Created
      Started
      Ended
    }
    
    enum BidStateType {
      EnglishAuction
      OpenEdition
    }
    
    enum PriceFloorType {
      None
      Minimum
      BlindedPrice
    }
    
    enum VaultState {
      Inactive
      Active
      Combined
      Deactivated
    }
    
    type VaultData {
      key: Int
      tokenProgram: PublicKey
      fractionMint: PublicKey
      authority: PublicKey
      fractionTreasury: PublicKey
      redeemTreasury: PublicKey
      allowFurtherShareCreation: Boolean
      pricingLookupAddress: PublicKey
      tokenTypeCount: Int
      state: VaultState
      lockedPricePerShare: BigNumber
    }
    
    type Vault {
      data: VaultData
    }
    
    type PriceFloor {
      type: PriceFloorType
      hash: Hash
      minPrice: BigNumber
    }
    
    type Bid {
      key: PublicKey,
      amount: BigNumber
    }
    
    type BidState {
      type: BidStateType
      bids: [Bid],
      max: BigNumber
    }
    
    type AuctionData {
      authority: PublicKey
      tokenMint: PublicKey
      lastBid: BigNumber
      endedAt: BigNumber
      endAuctionAt: BigNumber
      auctionGap: BigNumber
      priceFloor: PriceFloor
      bidState: BidState
      state: AuctionState
      bidRedemptionKey: PublicKey
    }
    
    type BidderMetadataData {
      bidderPubkey: PublicKey
      auctionPubkey: PublicKey
      lastBid: BigNumber
      lastBidTimestamp: BigNumber
      cancelled: Boolean
    }
    
    type BidderMetadata {
      data: BidderMetadataData
    }
    
    type BidderPotData {
      bidderPot: PublicKey
      bidderAct: PublicKey
      auctionAct: PublicKey
      emptied: Boolean
    }
    
    type BidderPot {
      data: BidderPotData
    }
    
    type Auction {
      data: AuctionData
      bidderMetadata: [BidderMetadata]
      bidderPots: [BidderPot]
    }
    
    type AuctionManagerState {
      status: Int
      safetyConfigItemsValidated: BigNumber
      bidsPushedToAcceptPayment: BigNumber
      hasParticipation: Boolean
    }
  
    type AuctionManagerData {
      key: Int
      store: PublicKey
      authority: PublicKey
      auction: PublicKey
      vault: PublicKey
      acceptPayment: PublicKey
      state: AuctionManagerState
    }
  
    type AuctionManager {
      data: AuctionManagerData
      auction: Auction
      vault: Vault
    }
    
    type StoreData { 
      key: Int
      public: Boolean
      auctionProgram: PublicKey
      tokenVaultProgram: PublicKey
      tokenMetadataProgram: PublicKey
      tokenProgram: PublicKey
    }
    
    type Creator {
      address: PublicKey
      verified: Boolean
      share: Boolean
    }
    
    type MetadataDataData {
      name: String
      symbol: String
      uri: String
      sellerFeeBasisPoints: Int
      creators: [Creator]
    }
    
    type MetadataData {
      key: Int
      updateAuthority: PublicKey
      mint: PublicKey
      primarySaleHappened: Boolean
      isMutable: Boolean
      data: MetadataDataData
    }
    
    type MasterEditionV1Data {
      key: Int
      supply: BigNumber
      maxSupply: BigNumber
      printingMint: PublicKey
      oneTimePrintingAuthorizationMint: PublicKey
    }
    
    type MasterEditionV2Data {
      key: Int 
      supply: BigNumber
      maxSupply: BigNumber
    }
    
    type LimitedEditionData {
      key: Int
      parent: PublicKey
      edition: BigNumber
    }
    
    union EditionData = MasterEditionV1Data | MasterEditionV2Data | LimitedEditionData
    
    type Edition {
      data: EditionData
    }
    
    type Metadata {
      data: MetadataData
      edition: Edition
    }
    
    type WhitelistedCreatorData {
      key: Int
      address: PublicKey
      activated: Boolean
    }
    
    type WhitelistedCreator {
      data: WhitelistedCreatorData
      metadata: [Metadata]
    }
  
    type Store {
      data: StoreData
      auctionManagers: [AuctionManager]
      whitelistedCreators: [WhitelistedCreator]
    }
  
    type Query {
      store(storeId: PublicKey!): Store
    }
  `,
  resolvers: scalarResolvers,
});

export async function getSchema() {
  return schema;
}
