import * as z from 'https://cdn.skypack.dev/zod@3.5.1';


//#region Zod Object Definitions:

export const StockDatumSchema = z.object( {
    "x": z.string(),
    "y": z.number(),
} );
export type StockDatum = z.infer<typeof StockDatumSchema>;

export const ErrorDataSchema = z.object( {
    "code": z.number(),
    "message": z.string(),
    "status": z.string(),
} );
export type ErrorData = z.infer<typeof ErrorDataSchema>;

export const TwelveDataTimeSeriesSchema = z.object( {
    "stockData": z.array( StockDatumSchema ),
    "errorData": ErrorDataSchema,
    "error": z.boolean(),
} );

export type TimeSeriesStockData = z.infer<typeof TwelveDataTimeSeriesSchema>;

//#endregion


/** 
 * Calls the Azure Function to get an array of price quotes for 
 * the most recent day that the stock market was open.
 * @param symbolToUse - Ticker symbol for which to get data.
 * @returns TimeSeriesStockData Promise, which includes either data or error info.
 */
export async function getTimeSeries( symbolToUse : string )
{
    try 
    {
        // local URL to testing purposes - need to run serer as func host start --cors *
//        const apiURL: string = 'http://localhost:7071/api/GetTimeSeries?symbol=';
        const apiURL = 'https://stockquotes-jcz-c-sharp.azurewebsites.net/api/GetTimeSeries?symbol=';

        const apiString = apiURL + encodeURI( symbolToUse );
        const response = await fetch( apiString );

        if ( !response.ok ) 
        {
            throw new Error( `HTTP error: ${response.status}` );
        }

        let responseText = await response.text();
        console.log( responseText );
        return ( TwelveDataTimeSeriesSchema.parse( JSON.parse( responseText ) ) );
    }
    catch ( error )
    {
        if ( error instanceof z.ZodError )
        {
            console.log( error.issues );
        }
        throw error;
    }
}
