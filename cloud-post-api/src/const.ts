export enum NODE_ENV_VALUES {
    development = 'development',
    production = 'production'
}

export type NODE_ENV_VALUE = typeof NODE_ENV_VALUES[keyof typeof NODE_ENV_VALUES]
