type Link = string;
type Carousel = CarouselSlide[];
type Breadcrumb = BreadcrumbItem[];

/**
 * Breadcrumb item used in the breadcrumb
 */
interface BreadcrumbItem {
    /**
     * Optional url, last item does not need it.
     */
    url?: string;

    /**
     * The label for the breadcrumb item.
     */
    label: string;
}

/**
 * Accordion item
 */
interface AccordionItem {
    title: string;
    body: string;
}

interface HippoDocument extends Object {
    hippo: object;
}


/**
 * Model for slide of carousel
 */
interface CarouselSlide {
    title: string;
    description: string;
    imageUrl: string;
}

interface CardLink {
    label: string;
    url: string;
    type: 'link' | 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
}

interface Card {
    headerText ?: string;

    title: string;
    subtitle?: string;
    description: string;
    link?: string;

    image: string;
    imageBottom ?: boolean;
    links ?: CardLink[];

    footerText ?: string;
}

interface List {
    cardVariation: 'vertical'|'horizontal'|'overlay';
    items: Card[]
}

interface MetaTag {
    name: string;
    content: string;
}

type MetaTags = MetaTag[];


interface Navbar {

    /**
     * ID for navbar toggler
     */
    id ?: string;

    /**
     * The style classes added to the wrapper
     */
    style ?: string;

    /**
     * Classes pushed onto the navbar wrapper div
     */
    barClasses ?: string;

    /**
     * Brand name (optional)
     */
    name ?: string;

    /**
     * Image shown (optional)
     */
    image ?: string;

    /**
     * Link name and/or image navigate to when clicked
     */
    link ?: string;

    /**
     * If set to true, search bar is shown
     */
    showSearch ?: boolean;

    /**
     * How to position the navbar.
     */
    position: 'default' | 'fixed-top' | 'fixed-bottom' | 'sticky-top'

    /**
     * A set of navigation items
     */
    navigation ?: NavbarItem[]

}

/**
 * A navigation item that is rendered in the navigation bar.
 */
interface NavbarItem {

    /**
     * Label in menu item
     */
    label: string;

    /**
     * Where does it link to?
     */
    url: string;

    /**
     * If true, will be grayed out
     */
    disabled ?: boolean;

    /**
     * If true, it's the current page.
     */
    active ?: boolean;

    /**
     * If children specified, we need to render an ID
     */
    id ?: string;

    /**
     * Children of this item (no url required if filled out)
     */
    children ?: NavbarItem[];
}


interface BlogEmbedConfig {
    provider: string;
    endpoint: string;
    scheme: string[];
}
