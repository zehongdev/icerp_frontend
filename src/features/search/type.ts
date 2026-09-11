export interface InquirySearchItem {

    id: number;

    part_number: string;

    brand: string;

    package: string;

    version: string;

}



export interface SupplierSearchItem {

    id: string;

    name: string;

    code?: string;

    status: string;

}



export interface GlobalSearchResult {
    keyword: string;
    limit: number;
    results: {
        inquiries: InquirySearchItem[];
        suppliers: SupplierSearchItem[];
    },
    totals: {
        inquiries: number;
        suppliers: number;
    }

}