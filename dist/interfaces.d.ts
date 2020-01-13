export interface HtmlToTextOptions {
    wordwrap?: number | null | false;
    tables?: string[] | Boolean;
    preserveNewlines?: Boolean;
    uppercaseHeadings?: Boolean;
    singleNewLineParagraphs?: Boolean | null;
    hideLinkHrefIfSameAsText?: Boolean;
    linkHrefBaseUrl?: string | null;
    noLinkBrackets?: Boolean;
    noAnchorUrl?: Boolean;
    baseElement?: string | string[];
    returnDomByDefault?: Boolean;
    format?: any;
    decodeOptions?: {
        isAttributeValue?: Boolean;
        strict?: Boolean;
    };
    longWordSplit?: {
        wrapCharacters?: string[];
        forceWrapOnLimit?: Boolean;
    };
    unorderedListItemPrefix?: string;
}
export interface HtmlToTextRunOptions extends HtmlToTextOptions {
    lineCharCount?: number;
    isInPre?: Boolean;
}
