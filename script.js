// -- GLOBAL --
const MAX_CHARS = 150;
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api";

const textareaEl = document.querySelector(".form__textarea");
const counterEl = document.querySelector(".counter");
const formEl = document.querySelector(".form");
const feedbackListEl = document.querySelector(".feedbacks");
const submitBtnEl = document.querySelector(".submit-btn");
const spinnerEl = document.querySelector(".spinner");
const hashtagListEl = document.querySelector(".hashtags");
const hashtagListElms = document.querySelectorAll(".hashtag");

const renderFeedbackItem = (feedbackItemObject) => {
	// render feedback item HTML
	const feedbackItemHtml = `
	<li class="feedback">
	<button class="upvote">
		<i class="fa-solid fa-caret-up upvote__icon"></i>
		<span class="upvote__count">${feedbackItemObject.upvoteCount}</span>
	</button>
	<section class="feedback__badge">
		<p class="feedback__letter">${feedbackItemObject.badgeLetter}</p>
	</section>
	<div class="feedback__content">
		<p class="feedback__company">${feedbackItemObject.company}</p>
		<p class="feedback__text">${feedbackItemObject.text}</p>
	</div>
	<p class="feedback__date">${
		feedbackItemObject.daysAgo === 0 ? "NEW" : `${feedbackItemObject.daysAgo}d`
	}</p>
	</li>`;
	// insert new feedback item in list
	feedbackListEl.insertAdjacentHTML("afterbegin", feedbackItemHtml);
};

// -- COUNTER COMPONENT --

(() => {
	const inputHandler = () => {
		// determine maximum number of characters
		const maxNrChars = MAX_CHARS;
		// determine number of characters currently typed
		const nrCharsTyped = textareaEl.value.length;
		// calculate number of characters left
		const charsLeft = maxNrChars - nrCharsTyped;
		// show number of characters left
		counterEl.textContent = charsLeft;
	};

	textareaEl.addEventListener("input", inputHandler);
})();

// -- FORM COMPONENT --

(() => {
	const showVisualIndicator = (textCheck) => {
		// show valid indicator
		formEl.classList.add(`${textCheck}`);
		// remove visual indicator
		setTimeout(() => {
			formEl.classList.remove(`${textCheck}`);
		}, 1700);
	};

	const submitHandler = (e) => {
		// prevent default browser action (submitting form data to 'action'-address and refreshing page)
		e.preventDefault();
		// get text from textarea
		const text = textareaEl.value;
		// validate text (e.g. check if #hashtag is present and text is Long enough)
		if (text.includes("#") && text.length >= 5) {
			showVisualIndicator("form--valid");
		} else {
			showVisualIndicator("form--invalid");
			// focus textarea
			textareaEl.focus();
			// stop this function execution
			return;
		}
		// we have text, now extract other info from text
		const hashtag = text.split(" ").find((word) => word.includes("#"));
		const company = hashtag.substring(1);
		const badgeLetter = company.substring(0, 1).toUpperCase();
		const upvoteCount = 0;
		const daysAgo = 0;

		// create feedbackItem object
		const feedbackItemObject = {
			upvoteCount: upvoteCount,
			company: company,
			badgeLetter: badgeLetter,
			daysAgo: daysAgo,
			text: text,
		};
		// render feedback item HTML
		renderFeedbackItem(feedbackItemObject);
		// send feedback item to server
		fetch(`${BASE_API_URL}/feedbacks`, {
			method: "POST",
			body: JSON.stringify(feedbackItemObject),
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					console.log("Something went wrong");
					return;
				}
				console.log("Succesfully submitted");
			})
			.catch((error) => {
				console.log(error);
			});
		// clear textarea
		textareaEl.value = "";
		// blur submit button
		submitBtnEl.blur();
		// reset counter
		counterEl.textContent = MAX_CHARS;
	};

	formEl.addEventListener("submit", submitHandler);
})();

// -- FEEDBACK LIST COMPONENT --

(() => {
	const clickHandler = (e) => {
		// get clicked HTML element
		const clickedEl = e.target;
		// determine if user intended to upvote or expand
		const upvoteIntention = clickedEl.className.includes("upvote");
		// run the appropriate logic for each option
		if (upvoteIntention) {
			// get the closest upvote button
			const upvoteBtnEl = clickedEl.closest(".upvote");
			// disable upvote btn (prevent double-click, spam)
			upvoteBtnEl.disabled = true;
			// select the upvount count element within the upvote button
			const upvoteCountEl = upvoteBtnEl.querySelector(".upvote__count");
			// get currently displayed upvote count and novert is as number (adding +)
			let upvoteCount = +upvoteCountEl.textContent;
			// increment by 1
			upvoteCountEl.textContent = ++upvoteCount;
		} else {
			// expand the clicked feedback item
			clickedEl.closest(".feedback").classList.toggle("feedback--expand");
		}
	};

	feedbackListEl.addEventListener("click", clickHandler);

	fetch(`${BASE_API_URL}/feedbacks`)
		.then((response) => response.json())
		.then((data) => {
			// remove spinner
			spinnerEl.style.opacity = 0;
			setTimeout(() => {
				spinnerEl.remove();
			}, 500);
			// iterate over each feedbackItem in feedbacks array and render it in list
			data.feedbacks.forEach((feedbackItemObject) => {
				renderFeedbackItem(feedbackItemObject);
			});
		})
		.catch((error) => {
			feedbackListEl.textContent = `Failed to fetch feedback items. Error message: ${error.message}`;
		});
})();

// -- HASHTAGS LIST COMPONENT --

(() => {
	const clickHandler = (e) => {
		const clickedEl = e.target;
		clickedEl.classList.toggle("active");
		// stop function if click happend in list, but outside buttons
		if (clickedEl.className === "hashtags") {
			return;
		}
		// extract company name
		const companyNameFromHashtag = clickedEl.textContent
			.substring(1)
			.toLowerCase()
			.trim();

		console.log(`clicked element: ${companyNameFromHashtag}`);
		// iterate over each feedback item in the list
		feedbackListEl.childNodes.forEach((childNode) => {
			// stop iteration if it's a text node
			if (childNode.nodeType === 3) return;

			// select company name from FeedbackItem
			const companyNameFromFeedbackItem = childNode
				.querySelector(".feedback__company")
				.textContent.toLowerCase()
				.trim();
			// hide feedback item from list if company names are not equal
			companyNameFromHashtag !== companyNameFromFeedbackItem &&
			clickedEl.classList.contains("active")
				? (childNode.style.display = "none")
				: (childNode.style.display = "grid");
		});
	};

	hashtagListEl.addEventListener("click", clickHandler);
})();
