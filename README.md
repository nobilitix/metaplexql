# metaplexql

`metaplexql` is a graphql server for Metaplex apps on Solana.

*Note: This repository is in early development stages and isn't yet functional*
<img width="1440" alt="Screen Shot 2021-09-29 at 14 22 00" src="https://user-images.githubusercontent.com/1970424/135465319-60cce179-e1b1-480a-8e09-42c88cd2c9bc.png">
Current state of the repo in all its' early glory!

## Core functionality list
- [x] graphql server with a graphiql GUI
- [x] fetch most of the Store & derived data using `@metaplex/js`
- [ ] fetch whitelisted creators & their tokens

Next steps:
- [ ] add a queue system for requests to prevent rate limiting on public endpoints
- [ ] add the ability to cache data - ideally to make this extensible it should be an interchangeable adapter so that teams could build their own backends
- [ ] add the ability to deploy to a serverless enviornment (Workers/Lambda/Fly e.t.c)
- [ ] introduce a redis caching layer
- [ ] introduce an IPFS caching layer
- [ ] configurable logging
- [ ] ...?
- [ ] profit

## Developing
1. `git clone git@github.com:nobilitix/metaplexql.git`
2. `yarn`
3. `yarn dev` will run the graphql server in watch mode and recompile the TypeScript files in `src/` folder dynamically
4. access the graphql server at [http://localhost:3000/graphql](http://localhost:3000/graphql)

## Logging
`metaplexql` uses `winston` for logging and outputs the following two files by default:
- metaplexql-combined.log
- metaplexql-error.log

## Example Query
```
{
  store(storeId: "AUy7dGGBbHThDb1a6VdXHjiExGKUFbDvXQoQXg3VtbJG") {
    data {
      key
      public
      auctionProgram
      tokenVaultProgram
      tokenMetadataProgram
      tokenProgram
    }
    whitelistedCreators {
      data {
        key
        address
        activated
      }
      metadata {
        data {
          key
          updateAuthority
          mint
          primarySaleHappened
          isMutable
          data {
            name
            symbol
            uri
            sellerFeeBasisPoints
            creators {
              address
              verified
              share
            }
          }
        }
        edition {
          data {
            ... on MasterEditionV1Data {
              __typename
              key
              supply
              maxSupply
              printingMint
              oneTimePrintingAuthorizationMint
            }

            ... on MasterEditionV2Data {
              __typename
              key
              supply
              maxSupply
            }

            ... on LimitedEditionData {
              __typename
              key
              parent
              edition
            }  
          }
        }
      }
    }
    auctionManagers {
      data {
        key
        store
        authority
        auction
        vault
        acceptPayment
        state {
          status
          safetyConfigItemsValidated
          bidsPushedToAcceptPayment
          hasParticipation
        }
      }
      auction {
        data {
          authority
          tokenMint
          lastBid
          endedAt
          endAuctionAt
          auctionGap
          priceFloor {
            type
            hash
            minPrice
          }
          bidState {
            type
            max
            bids {
              key
              amount
            }
          }
          state
          bidRedemptionKey
        }
        bidderMetadata {
          data {
            bidderPubkey
            auctionPubkey
            lastBid
            lastBidTimestamp
            cancelled
          }
        }
        bidderPots {
          data {
            bidderPot
            bidderAct
            auctionAct
            emptied
          }
        }
      }
      vault {
        data {
          key
          tokenProgram
          fractionMint
          authority
          fractionTreasury
          redeemTreasury
          allowFurtherShareCreation
          pricingLookupAddress
          tokenTypeCount
          state
          lockedPricePerShare
        }
      }
    }
  }
}
```

Additionally, if the environment is not production, it outputs all logs to console.
