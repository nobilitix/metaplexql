import { GraphQLScalarType, Kind } from "graphql";
import {
  Auction,
  BidderMetadata,
  BidderPot,
  Connection,
  Store,
  StringPublicKey,
  Vault,
  WhitelistedCreator,
} from "@metaplex/js";
import BN from "bn.js";

const connection = new Connection(
  "https://solana--mainnet.datahub.figment.io/apikey/a02572016ca069f61b7f87350d495c0e"
);

const bidderMetadata = (auctionAccount: Auction) => async () => {
  const bidderMetadataAccounts = await auctionAccount.getBidderMetadata(
    connection
  );
  return bidderMetadataAccounts.map(
    (bidderMetadataAccount: BidderMetadata) => ({
      data: {
        bidderPubkey: bidderMetadataAccount.data.bidderPubkey,
        auctionPubkey: bidderMetadataAccount.data.auctionPubkey,
        lastBid: bidderMetadataAccount.data.lastBid,
        lastBidTimestamp: bidderMetadataAccount.data.lastBidTimestamp,
        cancelled: bidderMetadataAccount.data.cancelled,
      },
    })
  );
};

const bidderPots = (auctionAccount: Auction) => async () => {
  const bidderPotAccounts = await auctionAccount.getBidderPots(connection);
  return bidderPotAccounts.map((bidderPot: BidderPot) => ({
    data: {
      bidderPot: bidderPot.data.bidderPot,
      bidderAct: bidderPot.data.bidderAct,
      auctionAct: bidderPot.data.auctionAct,
      emptied: bidderPot.data.emptied,
    },
  }));
};

const auction = (auctionId: StringPublicKey) => async () => {
  const auctionAccount = await Auction.load(connection, auctionId);
  return {
    data: {
      authority: auctionAccount.data.authority,
      tokenMint: auctionAccount.data.tokenMint,
      lastBid: auctionAccount.data.lastBid,
      endedAt: auctionAccount.data.endedAt,
      endAuctionAt: auctionAccount.data.endAuctionAt,
      auctionGap: auctionAccount.data.auctionGap,
      state: auctionAccount.data.state,
      priceFloor: {
        type: auctionAccount.data.priceFloor.type,
        hash: auctionAccount.data.priceFloor.hash,
        minPrice: auctionAccount.data.priceFloor.minPrice,
      },
      bidState: {
        type: auctionAccount.data.bidState.type,
        bids: auctionAccount.data.bidState.bids,
        max: auctionAccount.data.bidState.max,
      },
    },
    bidderMetadata: bidderMetadata(auctionAccount),
    bidderPots: bidderPots(auctionAccount),
  };
};

const vault = (vaultId: StringPublicKey) => async () => {
  const vaultAccount = await Vault.load(connection, vaultId);
  return {
    data: {
      key: vaultAccount.data.key,
      tokenProgram: vaultAccount.data.tokenProgram,
      fractionMint: vaultAccount.data.fractionMint,
      authority: vaultAccount.data.authority,
      fractionTreasury: vaultAccount.data.fractionTreasury,
      redeemTreasury: vaultAccount.data.redeemTreasury,
      allowFurtherShareCreation: vaultAccount.data.allowFurtherShareCreation,
      pricingLookupAddress: vaultAccount.data.pricingLookupAddress,
      tokenTypeCount: vaultAccount.data.tokenTypeCount,
      state: vaultAccount.data.state,
      lockedPricePerShare: vaultAccount.data.lockedPricePerShare,
    },
  };
};

const auctionManagers = (storeAccount: Store) => async () => {
  const auctionManagerAccounts = await storeAccount.getAuctionManagers(
    connection
  );

  return auctionManagerAccounts.map((auctionManager) => ({
    data: {
      key: auctionManager.data.key,
      store: auctionManager.data.store,
      authority: auctionManager.data.authority,
      auction: auctionManager.data.auction,
      vault: auctionManager.data.vault,
      acceptPayment: auctionManager.data.acceptPayment,
      state: {
        status: auctionManager.data.state.status,
        safetyConfigItemsValidated:
          auctionManager.data.state.safetyConfigItemsValidated,
        bidsPushedToAcceptPayment:
          auctionManager.data.state.bidsPushedToAcceptPayment,
        hasParticipation: auctionManager.data.state.hasParticipation,
      },
    },
    vault: vault(auctionManager.data.vault),
    auction: auction(auctionManager.data.auction),
  }));
};

const whitelistedCreators = (storeAccount: Store) => async () => {
  const creators = await storeAccount.getWhitelistedCreators(connection);
  const pdas = await Promise.all(
    creators.map((creator) =>
      WhitelistedCreator.getPDA(storeAccount.pubkey, creator.data.address)
    )
  );

  const storeCreators = creators.filter(
    (creator, key) => pdas[key].toBase58() === creator.pubkey.toBase58()
  );

  return storeCreators.map((storeCreator) => ({
    key: storeCreator.data.key,
    address: storeCreator.data.address,
    activated: storeCreator.data.activated,
  }));
};

const store = async ({ storeId }: { storeId: StringPublicKey }) => {
  const storeAccount = await Store.load(connection, storeId);
  return {
    data: {
      key: storeAccount.data.key,
      public: storeAccount.data.public,
      auctionProgram: storeAccount.data.auctionProgram,
      tokenVaultProgram: storeAccount.data.tokenVaultProgram,
      tokenMetadataProgram: storeAccount.data.tokenMetadataProgram,
      tokenProgram: storeAccount.data.tokenProgram,
    },
    auctionManagers: auctionManagers(storeAccount),
    whitelistedCreators: whitelistedCreators(storeAccount),
  };
};

export const scalarResolvers = {
  PublicKey: new GraphQLScalarType({
    name: "PublicKey",
    description: "Solana PublicKey",
    serialize: (value: StringPublicKey) => value,
    parseValue: (value: string) => value,
  }),
  BigNumber: new GraphQLScalarType({
    name: "BigNumber",
    serialize: (value: BN) => value.toString(10),
    parseValue: (value: string) => new BN(value, 10),
    parseLiteral: (ast) => {
      if (ast.kind === Kind.INT) {
        return new BN(ast.value, 10);
      }
      if (ast.kind === Kind.STRING) {
        return new BN(ast.value, 10);
      }
      return null;
    },
  }),
  Hash: new GraphQLScalarType({
    name: "Hash",
    serialize: (value: Uint8Array) => Buffer.from(value).toString("hex"),
    parseValue: (value: string) => Uint8Array.from(Buffer.from(value, "hex")),
    parseLiteral: (ast) => {
      if (ast.kind === Kind.STRING) {
        return Uint8Array.from(Buffer.from(ast.value, "hex"));
      }
      return null;
    },
  }),
  AuctionState: {
    Created: 0,
    Started: 1,
    Ended: 2,
  },
  BidStateType: {
    EnglishAuction: 0,
    OpenEdition: 1,
  },
  PriceFloorType: {
    None: 0,
    Minimum: 1,
    BlindedPrice: 2,
  },
  VaultState: {
    Inactive: 0,
    Active: 1,
    Combined: 2,
    Deactivated: 3,
  },
};

export const rootValue = {
  store,
};
