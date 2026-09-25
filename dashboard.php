<style>
    .dashboard-header
    {
        margin-bottom: 20px;
        max-width: 717px;
    }
    .dashboard-heading
    {
        font-size: 32px;
        line-height: 37px;
        color: #212326;
        font-family: 'itc-avant-garde-gothic-pro', sans-serif!important;
        margin-bottom: 10px;
    }
    .dashboard-heading span
    {
        font-weight: bold;
    }
    .dashboard-subheading
    {
        color: #212326;
        font-size: 16px;
        line-height: 25px;
        font-family: 'itc-avant-garde-gothic-pro', sans-serif!important;
        letter-spacing: 1px;
        font-weight: 500;
    }
    .dashboard-data-wrap
    {
        max-width: 1068px;
        width: 100%;
        margin: 0 auto;
        display: flex;
        flex-wrap: wrap;
        gap: 50px;
    }
    .dashboard-data-card
    {
        max-width: 322px;
        width: 100%;
        padding: 28px 28px 28px 24px;
        background: rgba(255,255,255,.5);
        border: 1px solid #FFFFFF;
        display: flex;
        gap: 16px;
        align-items: center;
        border-radius: 8px;
    }
    .dashboard-data-card-icon
    {
        flex-shrink: 0;
        width: 20px;
    }
    .dashboard-data-card-content
    {
        position: relative;
    }
    .dashboard-data-card-title
    {
        font-size: 15px;
        line-height: 20px;
        color: #212326;
        font-family: 'avenir-next-lt-pro', sans-serif!important;
    }
    .dashboard-data-card-status
    {
        font-size: 16px;
        line-height: 22px;
        color: #68C862;
        font-weight: bold;
        font-family: 'avenir-next-lt-pro', sans-serif!important;
    }
    .dashboard-data-card-status-icon
    {
        height: 18px;
        width: 18px;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
    }
</style>

<div class="dashboard-wrapper">

    <div class="dashboard-header">
        <h2 class="dashboard-heading">Welcome to <span>Active Research Collaboration</span></h2>
        <p class="dashboard-subheading">A structured environment that organizes both what is studied and how research is conducted across decentralized scientific domains.</p>
    </div>

    <div class="dashboard-data-wrap">

        <div class="dashboard-data-card">
            <div class="dashboard-data-card-icon">

            </div>
            <div class="dashboard-data-card-content">
                <p class="dashboard-data-card-title">
                    Membership Status
                </p>
                <p class="dashboard-data-card-status">
                    Active
                </p>
                <span class="dashboard-data-card-status-icon">

                </span>
            </div>
        </div>

        <div class="dashboard-data-card">
            <div class="dashboard-data-card-icon">

            </div>
            <div class="dashboard-data-card-content">
                <p class="dashboard-data-card-title">
                    Verification Status
                </p>
                <p class="dashboard-data-card-status">
                    Not Verified
                </p>
                <span class="dashboard-data-card-status-icon">

                </span>
            </div>
        </div>

        <div class="dashboard-data-card">
            <div class="dashboard-data-card-icon">

            </div>
            <div class="dashboard-data-card-content">
                <p class="dashboard-data-card-title">
                    Research Access
                </p>
                <p class="dashboard-data-card-status">
                    Full System Access Enabled
                </p>
                <span class="dashboard-data-card-status-icon">

                </span>
            </div>
        </div>

    </div>

</div>