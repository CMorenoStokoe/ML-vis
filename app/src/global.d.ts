// Tell typescript that importing a .csv file gives a string
declare module '*.csv'{
    const content: string;
    export default content;
}