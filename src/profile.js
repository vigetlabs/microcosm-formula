const LOG_COST = !!process.env.DEBUG && typeof performance !== 'undefined'

export const mark = LOG_COST ? performance.mark : name => {}

export const measure = LOG_COST ? performance.measure : (name, start, end) => {}
