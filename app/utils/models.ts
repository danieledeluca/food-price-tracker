export enum Supermarkets {
    Amazon = 'Amazon',
    Coop = 'Coop',
    Despar = 'Despar',
    Emisfero = 'Emisfero',
    Lidl = 'Lidl',
}

export enum SupermarketsFields {
    Name = 'Nome',
}

export enum FoodsFields {
    Name = 'Nome',
    Brand = 'Marca',
    Type = 'Tipologia',
}

export enum PriceHistoryFields {
    Name = 'Nome',
    Food = 'Alimento',
    Brand = 'Marca',
    Supermarket = 'Supermercato',
    Date = 'Data',
    Packaging = 'Confezione (g)',
    PricePerPack = 'Prezzo a confezione',
    PricePerKg = 'Prezzo al kg',
}

export interface Food {
    [FoodsFields.Brand]: string;
    [FoodsFields.Type]: string;
    [FoodsFields.Name]: string;
    [key: string]: string;
}

export interface PriceHistory {
    [PriceHistoryFields.Packaging]: string;
    [PriceHistoryFields.Food]: string;
    [PriceHistoryFields.PricePerKg]: string;
    [PriceHistoryFields.PricePerPack]: string;
    [PriceHistoryFields.Date]: string;
    [PriceHistoryFields.Brand]: string;
    [PriceHistoryFields.Supermarket]: string;
    [PriceHistoryFields.Name]: string;
    [key: string]: string;
}
