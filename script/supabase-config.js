//Yang baca ini silahkan baca dan resapi url sama key nya otak atik ajh asw
const supabaseUrl = "https://nrgxggpmipbvecjshvxf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZ3hnZ3BtaXBidmVjanNodnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNDUxMjksImV4cCI6MjA1NjcyMTEyOX0.rJeqNwDJ794OUIxR0Zlr0ZNvx0rysTeEPfc5OmcUGqM";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Function to check if user is logged in via session
async function checkVisitorSession() {
  const visitorName = sessionStorage.getItem('visitorName')
  if (visitorName) {
    return visitorName
  }
  return null
}

// Function to save visitor info to Supabase
async function saveVisitorInfo(name, pageName) {
  try {
    // Check if the name is the magic word for admin access
    if (name.toLowerCase() === 'magic word') {
      // Remove the modal from DOM completely before redirecting
      const modal = document.getElementById('visitor-modal');
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      // Redirect to admin page
      window.location.href = '../pages/admin.html';
      return true;
    }

    const { data, error } = await supabase
      .from('visitors')
      .insert([
        {
          name: name,
          page_visited: pageName,
          visit_time: new Date().toISOString()
        }
      ])

    if (error) {
      console.error('Error saving visitor:', error)
      return false
    }

    // Save to session storage
    sessionStorage.setItem('visitorName', name)

    // Remove the modal from DOM completely
    const modal = document.getElementById('visitor-modal');
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }

    return true
  } catch (err) {
    console.error('Error in saveVisitorInfo:', err)
    return false
  }
}

// Function to create and show visitor name modal
function showVisitorModal(pageName) {
  // First check if we already have a session
  const existingName = sessionStorage.getItem('visitorName')
  if (existingName) {
    console.log(`Welcome back, ${existingName}!`)
    return
  }

  // Remove any existing modal first
  const existingModal = document.getElementById('visitor-modal');
  if (existingModal && existingModal.parentNode) {
    existingModal.parentNode.removeChild(existingModal);
  }

  // Create modal
  const modalHtml = `
    <div id="visitor-modal">
      <div class="visitor-modal-content">
        <h2>Welcome!</h2>
        <p>Please enter your name to continue:</p>
        <input type="text" id="visitor-name" placeholder="Your name" class="visitor-input">
        <div class="visitor-button-container">
          <button id="visitor-submit" class="visitor-button">Continue</button>
        </div>
      </div>
    </div>
  `

  // Append modal to body
  const modalContainer = document.createElement('div')
  modalContainer.innerHTML = modalHtml
  document.body.appendChild(modalContainer.firstElementChild) // Append the modal element directly

  // Add event listener to the submit button
  document.getElementById('visitor-submit').addEventListener('click', async function () {
    const nameInput = document.getElementById('visitor-name')
    const visitorName = nameInput.value.trim()

    if (visitorName) {
      await saveVisitorInfo(visitorName, pageName)
    } else {
      nameInput.classList.add('error')
      setTimeout(() => nameInput.classList.remove('error'), 500)
    }
  })

  // Add event listener for Enter key
  document.getElementById('visitor-name').addEventListener('keypress', async function (e) {
    if (e.key === 'Enter') {
      const visitorName = this.value.trim()
      if (visitorName) {
        await saveVisitorInfo(visitorName, pageName)
      } else {
        this.classList.add('error')
        setTimeout(() => this.classList.remove('error'), 500)
      }
    }
  })
}