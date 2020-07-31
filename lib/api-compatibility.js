const Helpers = require('./helpers');
const WalletsLib = require('./wallets');

/* PREVIOUS API
    {
		# wallets: VALID_WALLETS,
		# getBoostRank: true,
		# rankHours: 24,
		# outputs: [
			{
				to: "18YCy8VDYcXGnekHC4g3vphnJveTskhCLf", amount: 0.0004, currency: 'BSV'
			}
		],
    	# showContentPreview: true,
		# content: '4d0295d207f3a00d73f069fc4aa5e06d3fe98d565af9f38983c0d486d6166a09',
		# tag: 'bitcoin',
		# category: 'B' // defaults to 'B' underneath.
		# content: '4d0295d207f3a00d73f069fc4aa5e06d3fe98d565af9f38983c0d486d6166a09',
		# initialWallet: 'moneybutton', // 'moneybutton' or 'relayx'
		# tag: '$',
		# showTagField: false, // defaults to true
		# showCategoryField: false, // defaults to false
		minDiff: 1, // defaults to 1; ignored if getBoostRank is true
		maxDiff: 40, // defaults to 40; ignored if getBoostRank is true
		initialDiff: 1, // defaults to the minimal difficulty or 1; ignored if getBoostRank is true
		diffMultiplier: 0.00002, // defaults to 0.00002
		lockDiff: false, // defaults to false
		showInputDiff: false, // defaults to false
		showSliderDiff: true, // defaults to true
		sliderDiffStep: 1, // defaults to 1
		sliderDiffMarkerStep: 10, // defaults to 10, use 0 to disable markers
		sliderMarkersMaxCount: 15, // defaults to 15
		# displayMessage: 'hello world',
	}
*/

/* NEW API
    {
        message: { // displayMessage
			text: '', // displayMessage
			markdown: '', // new
			html: '' // new
		},
		content: {
			hash: '' // content => If is a hash, show content, else hides the content
			show: true // showContentPreview
		},
		tag: { // tag => if is a string or empty string show tag field with tag filled
			value: '',
			show: true, // showTagField 
			disabled: false
		}, 
		category: { // category => if is a string or empty string show category field with category filled
			value: '',
			show: true, // showCategoryField 
			disabled: false
		},
		category: undefined, 
		boostRank: { // getBoostRank
			hours: 24, // rankHours
			tags: [], // filters the api with tags
			category: [] // filter the api with categories
		},
		difficulty: {
			min: 1, // minDiff
			max: 40, // maxDiff
			initial: 20, // initialDiff
			multiplier: 0.00002, // diffMultiplier
			locked: false, // lockDiff
			showInput: false, // showInputDiff
		},
		slider: { // showSliderDiff
			step: 1, // sliderDiffStep
			markers: {
				step: 10, // sliderDiffMarkerStep
				maxCount: 15, // sliderMarkersMaxCount
			},
			logScale: false,
		},
		wallets: {
			available: ['moneybutton', 'relayx'], // wallets
			initial: 'moneybutton' // initialWallet
		},
		outputs: [],
    }
*/

export function normalizeLegacyApi(opts) {
	return {
		message: normalizeMessage(opts),
		content: normalizeContent(opts),
		tag: normalizeTag(opts),
		category: normalizeCategory(opts),
		boostRank: normalizeBoostRank(opts),
		difficulty: normalizeDifficulty(opts),
		slider: normalizeSlider(opts),
		wallets: normalizeWallets(opts),
		outputs: normalizeOutputs(opts)
	};
}

function normalizeMessage(opts) {
	let o = undefined;
	if (Helpers.hasStrLen(opts.message, 1)) return { text: opts.message };
	if (Helpers.hasObjProp(opts.message, 'text') && Helpers.hasStrLen(opts.message.text, 1))
		return { text: opts.message.text };
	// if (Helpers.hasObjProp(opts.message, 'markdown') && Helpers.hasStrLen(opts.message.markdown, 1)) return { markdown: opts.message.markdown };
	// if (Helpers.hasObjProp(opts.message, 'html') && Helpers.hasStrLen(opts.message.html, 1)) return { html: opts.message.html };

	// Verify old api
	if (Helpers.hasStrLen(opts.displayMessage, 1)) {
		// TODO: Detect markdown or html here
		o = {
			text: opts.displayMessage
			// markdown: undefined,
			// html: undefined
		};
	}
	return o;
}

function normalizeContent(opts) {
	let o = {};
	// if content is a hash string
	if (Helpers.hasStrLen(opts.content, 1)) {
		o = { hash: opts.content };
	}
	// if it is an object with a valid hash property
	else if (Helpers.hasObjProp(opts.content, 'hash') && Helpers.hasStrLen(opts.content.hash, 1)) {
		o = Object.assign({}, opts.content);
	}
	// if not a string, and not an object, return an error
	else return false;

	//
	if (Helpers.isStrictBool(opts.showContentPreview)) {
		o.show = opts.showContentPreview;
	}
	if (Helpers.isUndef(o.show)) {
		o.show = true;
	}
	return o;
}

function normalizeTag(opts) {
	const defaults = { value: '', show: true, disabled: false };
	let o = undefined;
	if (!opts.tag) return opts.showTagField === true ? defaults : o;
	if (Helpers.hasStrLen(opts.tag, 1)) {
		// when simple string
		o = Object.assign({}, defaults, { value: opts.tag });
	} else if (
		Helpers.hasObjProp(opts.tag) && // when object
		(Helpers.hasStrLen(opts.tag.value, 0) || opts.tag.show === true) // with valid value or only show tag
	) {
		o = Object.assign({}, defaults, opts.tag);
	}
	// if not a string, and not an object, consider undefined
	else return o;

	if (Helpers.isStrictBool(opts.showTagField)) {
		o.show = opts.showTagField;
	}
	if (Helpers.isUndef(o.show)) {
		o.show = true;
	}
	return o;
}

function normalizeCategory(opts) {
	const defaults = { value: '', show: true, disabled: false };
	let o = undefined;
	if (!opts.category) return opts.showCategoryField === true ? defaults : o;
	if (Helpers.hasStrLen(opts.category, 1)) {
		// when simple string
		o = Object.assign({}, defaults, { value: opts.category });
	} else if (
		Helpers.hasObjProp(opts.category) && // when object
		(Helpers.hasStrLen(opts.category.value, 0) || opts.category.show === true) // with valid value or only show category
	) {
		o = Object.assign({}, defaults, opts.category);
	}
	// if not a string, and not an object, consider undefined
	else return o;

	if (Helpers.isStrictBool(opts.showCategoryField)) {
		o.show = opts.showCategoryField;
	}
	if (Helpers.isUndef(o.show)) {
		o.show = true;
	}
	return o;
}

function normalizeBoostRank(opts) {
	// default values
	const DEFAULT_HOURS = 24;
	let o = {
		hours: DEFAULT_HOURS,
		tags: [],
		categories: []
	};

	// boostRank property overrides old api properties

	// if strictly true, returns default values else only false
	if (Helpers.isStrictBool(opts.boostRank)) {
		return opts.boostRank ? o : false;
	}
	// When object, overrides defaults and return
	else if (Helpers.hasObjProp(opts.boostRank)) {
		o = Object.assign({}, o, opts.boostRank);
		if (isNaN(o.hours) || o.hours <= 0) o.hours = DEFAULT_HOURS;
		return o;
	}

	// Here boostRank is considered not defined, because it is not a boolean or an object
	// So, start searching verifying old api values
	if (opts.getBoostRank === false) return false;
	if (Helpers.isUndef(opts.getBoostRank)) return o;

	// Here opts.getBoostRank is considered true
	o.hours = opts.rankHours > 0 ? opts.rankHours : DEFAULT_HOURS;
	return o;
}

function normalizeDifficulty(opts) {
	return {};
}

function normalizeSlider(opts) {
	return {};
}

function normalizeWallets(opts) {
	// console.log("WalletsLib", WalletsLib);
	let o = { available: WalletsLib.VALID_WALLETS, initial: WalletsLib.DEFAULT_WALLET };
	if (Helpers.hasObjProp(opts.wallets)) {
		o = Object.assign({}, o, opts.wallets);
	}
	// if (typeof opts.wallets !== 'string' && !Array.isArray(opts.wallets))
	else if (Helpers.hasStrLen(opts.wallets, 0)) {
		if (WalletsLib.isValidWallet(opts.wallets)) o.available = [opts.wallets];
	} else if (Array.isArray(opts.wallets) && opts.wallets.length > 0) {
		o.available = opts.wallets;
	}

	// fixing possible invalid wallets on the list
	o.available = WalletsLib.filterValidWallets(o.available);

	//
	if (Helpers.hasStrLen(opts.initialWallet, 1))
		o.initial = WalletsLib.getValidWallet(opts.initialWallet);
	else if (Helpers.hasStrLen(o.initial, 1)) o.initial = WalletsLib.getValidWallet(o.initial);

	return o;
}

function normalizeOutputs(opts) {
	return opts.outputs || [];
}