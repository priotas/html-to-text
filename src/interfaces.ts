export interface HtmlToTextOptions {
  wordwrap?: number | null | false; // XXX
  tables?: string[] | Boolean; // XXX
  preserveNewlines?: Boolean;
  uppercaseHeadings?: Boolean;
  singleNewLineParagraphs?: Boolean | null; // XXX
  hideLinkHrefIfSameAsText?: Boolean;
  linkHrefBaseUrl?: string | null; // XXX
  noLinkBrackets?: Boolean;
  noAnchorUrl?: Boolean;
  baseElement?: string | string[]; // XXX
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
