
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatMessages = document.getElementById("chatMessages");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const clearChatBtn = document.getElementById("clearChatBtn");

let isLoading = false;

// ========================================
// PHASE 2: SECURE MARKDOWN RENDERING
// ========================================

function renderMarkdown(text) {
    if (
        typeof marked === "undefined" ||
        typeof DOMPurify === "undefined"
    ) {
        throw new Error("Markdown libraries not loaded");
    }

    // Convert Markdown into HTML
    const rawHTML = marked.parse(text, {
        gfm: true,
        breaks: true
    });

    // Remove potentially unsafe HTML
    const cleanHTML = DOMPurify.sanitize(rawHTML, {
        USE_PROFILES: { html: true }
    });

    return cleanHTML;
}

// ========================================
// ADD CHAT MESSAGE
// ========================================

function addMessage(text, role = "assistant") {
    const welcome = document.getElementById("welcomeScreen");

    if (welcome) {
        welcome.remove();
    }

    const message = document.createElement("div");
    message.className = `message ${role}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "👤" : "🥗";

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    if (role === "assistant") {
        // Render AI response as secure Markdown
        bubble.classList.add("markdown-body");
        bubble.innerHTML = renderMarkdown(text);
    } else {
        // Keep user and error messages as plain text
        bubble.textContent = text;
    }

    message.appendChild(avatar);
    message.appendChild(bubble);

    chatMessages.appendChild(message);
    scrollToBottom();

    return message;
}

// ========================================
// SCROLL TO BOTTOM
// ========================================

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ========================================
// TYPING ANIMATION
// ========================================

function showTyping() {
    // Create typing message without Markdown rendering
    const message = document.createElement("div");
    message.className = "message assistant";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "🥗";

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    const typing = document.createElement("div");
    typing.className = "typing";

    for (let i = 0; i < 3; i++) {
        typing.appendChild(document.createElement("span"));
    }

    bubble.appendChild(typing);
    message.appendChild(avatar);
    message.appendChild(bubble);

    chatMessages.appendChild(message);
    scrollToBottom();

    return message;
}

// ========================================
// SEND MESSAGE TO FASTAPI
// ========================================

async function sendMessage(question) {
    if (typeof question !== "string") {
        return;
    }

    const text = question.trim();

    if (!text || isLoading) {
        return;
    }

    isLoading = true;
    sendBtn.disabled = true;
    messageInput.disabled = true;

    addMessage(text, "user");

    messageInput.value = "";
    messageInput.style.height = "auto";

    const typingMessage = showTyping();

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text
            })
        });

        if (!response.ok) {
            let detail = `HTTP error ${response.status}`;

            try {
                const errorData = await response.json();

                if (typeof errorData.detail === "string") {
                    detail = errorData.detail;
                }
            } catch {
                // Keep HTTP status error
            }

            throw new Error(detail);
        }

        const data = await response.json();

        if (typeof data.response !== "string") {
            throw new Error("Invalid response from server");
        }

        // Render the AI response
        const renderedHTML = renderMarkdown(data.response);

        typingMessage.remove();

        // Add assistant message using sanitized HTML
        const message = addMessage("", "assistant");
        const bubble = message.querySelector(".bubble");
        bubble.innerHTML = renderedHTML;

        scrollToBottom();

    } catch (error) {
        typingMessage.remove();

        addMessage(
            "Unable to get a response. " + error.message,
            "error"
        );

    } finally {
        isLoading = false;
        sendBtn.disabled = false;
        messageInput.disabled = false;
        messageInput.focus();
    }
}

// ========================================
// FORM SUBMISSION
// ========================================

chatForm.addEventListener("submit", function(event) {
    event.preventDefault();
    sendMessage(messageInput.value);
});

// ========================================
// ENTER / SHIFT + ENTER
// ========================================

messageInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        if (!event.isComposing) {
            sendMessage(messageInput.value);
        }
    }
});

// ========================================
// AUTO RESIZE TEXTAREA
// ========================================

messageInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 150) + "px";
});

// ========================================
// SUGGESTED QUESTIONS
// ========================================

document.querySelectorAll(".suggestion").forEach(button => {
    button.addEventListener("click", function() {
        sendMessage(this.dataset.question);
    });
});

// ========================================
// RESET CHAT
// ========================================

function resetChat() {
    if (isLoading) {
        return;
    }

    chatMessages.innerHTML = `
        <div class="welcome-screen" id="welcomeScreen">
            <div class="welcome-icon">🥗</div>
            <h1>Welcome to NutriBot AI</h1>
            <p>Ask me anything about healthy eating and nutrition.</p>
        </div>
    `;

    messageInput.value = "";
    messageInput.style.height = "auto";
    messageInput.focus();
}

// ========================================
// NEW CHAT / CLEAR CHAT
// ========================================

newChatBtn.addEventListener("click", resetChat);
clearChatBtn.addEventListener("click", resetChat);
