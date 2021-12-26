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
